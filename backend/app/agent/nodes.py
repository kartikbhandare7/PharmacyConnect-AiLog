import json
import re
from langchain_groq import ChatGroq
from app.core.config import settings
from app.agent.state import HCPInteractionState

# ── LLM clients ───────────────────────────────────────────────────────────────
_extract_llm = ChatGroq(
    api_key=settings.GROQ_API_KEY,
    model=settings.GROQ_EXTRACT_MODEL,
    temperature=0.0,   # zero temp — we want deterministic JSON, not creativity
)

_followup_llm = ChatGroq(
    api_key=settings.GROQ_API_KEY,
    model=settings.GROQ_FOLLOWUP_MODEL,
    temperature=0.4,
)


def _parse_json_robust(raw: str) -> dict:
    """
    Extracts JSON from LLM output that may contain markdown fences,
    preamble text, or trailing commentary.
    Strategy: find the first { and last } and parse what's between them.
    """
    text = raw.strip()

    # Try direct parse first
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Strip ```json ... ``` fences (handles nested and multi-line)
    text = re.sub(r"```(?:json)?\s*", "", text).strip().rstrip("`").strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Find outermost { ... } block — handles preamble like "Here is the JSON:"
    match = re.search(r"\{[\s\S]*\}", text)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass

    return {}


def _normalise_sentiment(raw) -> str | None:
    """Normalise sentiment to exactly positive/neutral/negative."""
    if not raw:
        return None
    val = str(raw).lower().strip()
    if val in ("positive", "good", "great", "enthusiastic", "interested"):
        return "positive"
    if val in ("negative", "bad", "poor", "resistant", "uninterested"):
        return "negative"
    if val in ("neutral", "mixed", "moderate"):
        return "neutral"
    return None


# ── Node 1: parse_intent ──────────────────────────────────────────────────────
async def parse_intent(state: HCPInteractionState) -> HCPInteractionState:
    state["raw_extraction"] = {}
    state["retry_count"] = state.get("retry_count", 0)
    return state


# ── Node 2: extract_entities ──────────────────────────────────────────────────
async def extract_entities(state: HCPInteractionState) -> HCPInteractionState:
    """
    Extracts structured fields from free-text using gemma2-9b-it.
    Prompt is extremely explicit to prevent the model returning null
    for data that is clearly present in the input.
    """
    prompt = f"""You are a data extraction engine for a pharmaceutical CRM.
Your ONLY job is to extract information from the input text below.

INPUT TEXT:
\"\"\"{state['raw_text']}\"\"\"

INSTRUCTIONS:
- Extract every piece of information that IS present. Do NOT return null for something that is mentioned.
- hcp_name: the doctor or HCP's name (e.g. "Dr. Sharma"). If mentioned, extract it.
- interaction_type: one of Meeting, Phone call, Email, Conference, Remote detail. Default to "Meeting" if a visit is described.
- topics_discussed: what was discussed (product names, clinical topics, etc.). Summarise in plain text.
- sentiment: the HCP's reaction. "positive" = interested/happy/enthusiastic. "neutral" = indifferent. "negative" = reluctant/dismissive. Words like "positive", "interested", "happy", "great" = positive.
- sentiment_confidence: 0.0 to 1.0, how confident you are in the sentiment.
- materials_mentioned: list of any brochures, PDFs, samples mentioned. Empty array [] if none.
- outcomes: any agreements or outcomes mentioned. null if none.

EXAMPLES:
Input: "Met Dr. Sharma, discussed OncoPlex, she was positive"
Output: {{"hcp_name": "Dr. Sharma", "interaction_type": "Meeting", "topics_discussed": "OncoPlex discussion", "materials_mentioned": [], "sentiment": "positive", "sentiment_confidence": 0.9, "outcomes": null}}

Input: "Call with Dr. Patel about trial enrollment, neutral response"
Output: {{"hcp_name": "Dr. Patel", "interaction_type": "Phone call", "topics_discussed": "Trial enrollment", "materials_mentioned": [], "sentiment": "neutral", "sentiment_confidence": 0.8, "outcomes": null}}

Now extract from the INPUT TEXT above. Return ONLY the JSON object, nothing else."""

    response = await _extract_llm.ainvoke(prompt)
    extracted = _parse_json_robust(response.content)

    # Populate state — never overwrite a field that already has a value
    # (in case this is a retry with clarification context)
    state["hcp_name"]            = extracted.get("hcp_name") or state.get("hcp_name")
    state["interaction_type"]    = extracted.get("interaction_type") or state.get("interaction_type") or "Meeting"
    state["topics_discussed"]    = extracted.get("topics_discussed") or state.get("topics_discussed")
    state["materials_mentioned"] = extracted.get("materials_mentioned") or state.get("materials_mentioned") or []
    state["sentiment"]           = _normalise_sentiment(extracted.get("sentiment")) or state.get("sentiment")
    state["sentiment_confidence"]= extracted.get("sentiment_confidence") or state.get("sentiment_confidence")
    state["outcomes"]            = extracted.get("outcomes") or state.get("outcomes")
    state["raw_extraction"]      = {**(state.get("raw_extraction") or {}), **extracted}

    return state


# ── Node 3: compliance_check ──────────────────────────────────────────────────
async def compliance_check(state: HCPInteractionState) -> HCPInteractionState:
    """
    Only flags missing if the field is genuinely absent — not just falsy.
    Checks str values are non-empty after stripping whitespace.
    """
    def present(val) -> bool:
        if val is None:
            return False
        if isinstance(val, str):
            return val.strip() != ""
        return bool(val)

    checks = {
        "hcp_name":        present(state.get("hcp_name")),
        "topics_discussed": present(state.get("topics_discussed")),
        "sentiment":       present(state.get("sentiment")),
    }

    missing = [k for k, ok in checks.items() if not ok]
    state["missing_fields"] = missing

    if missing:
        state["clarification_needed"] = True
        field_labels = {
            "hcp_name":        "which HCP (doctor) you visited",
            "topics_discussed": "what topics or products you discussed",
            "sentiment":       "how the HCP responded (positive, neutral, or negative)",
        }
        questions = " and ".join(field_labels[f] for f in missing)
        state["clarification_question"] = f"Could you also tell me {questions}?"
    else:
        state["clarification_needed"] = False
        state["clarification_question"] = None

    return state


# ── Node 4: generate_followups ────────────────────────────────────────────────
async def generate_followups(state: HCPInteractionState) -> HCPInteractionState:
    """
    Uses llama-3.3-70b-versatile to generate 3-5 concrete follow-up actions
    based on the visit details. Richer model for better reasoning quality.
    """
    prompt = f"""You are a pharmaceutical CRM assistant.
Based on this HCP interaction, generate 3 to 5 specific, actionable follow-up tasks for the rep.

HCP: {state.get('hcp_name', 'Unknown')}
Topics discussed: {state.get('topics_discussed', 'Not specified')}
Outcomes: {state.get('outcomes', 'Not specified')}
HCP sentiment: {state.get('sentiment', 'neutral')}

Return ONLY a JSON array of strings. Each string is one follow-up action.
Example: ["Schedule follow-up in 2 weeks", "Send Phase III data sheet", "Connect HCP with MSL team"]
No explanation, no markdown, only the JSON array."""

    response = await _followup_llm.ainvoke(prompt)

    try:
        followups = json.loads(response.content.strip())
        if not isinstance(followups, list):
            followups = []
    except json.JSONDecodeError:
        clean = response.content.strip().removeprefix("```json").removesuffix("```").strip()
        try:
            followups = json.loads(clean)
        except json.JSONDecodeError:
            followups = ["Schedule follow-up meeting", "Send relevant product materials"]

    state["suggested_followups"] = followups[:5]  # cap at 5
    return state