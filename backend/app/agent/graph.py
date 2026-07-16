try:
    from langgraph.graph import StateGraph, END  # type: ignore
except Exception:  # pragma: no cover - fallback for dev / lint environments
    # Minimal fallback implementations so linters/type-checkers don't fail
    END = "__END__"

    class StateGraph:
        def __init__(self, state_type):
            self._nodes = {}
            self._entry = None

        def add_node(self, name, func):
            self._nodes[name] = func

        def set_entry_point(self, name):
            self._entry = name

        def add_edge(self, a, b):
            # no-op for fallback
            pass

        def add_conditional_edges(self, node, fn, mapping):
            # no-op for fallback
            pass

        def compile(self):
            return self

        async def ainvoke(self, state):
            # Basic linear execution of nodes starting from entry point for fallback
            if not self._entry:
                return state
            # execute nodes in insertion order
            for name, fn in self._nodes.items():
                # if coroutine function, await it
                try:
                    if hasattr(fn, "__call__"):
                        result = fn(state)
                        if hasattr(result, "__await__"):
                            state = await result
                        else:
                            state = result
                except TypeError:
                    # skip invalid nodes in fallback
                    continue
            return state
from app.agent.state import HCPInteractionState
from app.agent.nodes import parse_intent, extract_entities, compliance_check, generate_followups
from app.schemas.interaction import ParsedInteractionData
# from app.agent.hcp_lookup  import lookup_hcp;

# ── Conditional edge: should we loop back or proceed? ─────────────────────────
def route_after_compliance(state: HCPInteractionState) -> str:
    """
    If fields are missing AND we haven't retried too many times,
    loop back to extract_entities with the original text + clarification context.
    Otherwise proceed to follow-up generation.
    """
    if state.get("clarification_needed") and state.get("retry_count", 0) < 2:
        return "needs_clarification"
    return "complete"


def increment_retry(state: HCPInteractionState) -> HCPInteractionState:
    state["retry_count"] = state.get("retry_count", 0) + 1
    return state


# ── Build the graph ───────────────────────────────────────────────────────────
def build_graph() -> StateGraph:
    graph = StateGraph(HCPInteractionState)

    graph.add_node("parse_intent",      parse_intent)
    graph.add_node("extract_entities",  extract_entities)
    graph.add_node("compliance_check",  compliance_check)
    graph.add_node("increment_retry",   increment_retry)
    graph.add_node("generate_followups", generate_followups)

    graph.set_entry_point("parse_intent")
    graph.add_edge("parse_intent", "extract_entities")
    graph.add_edge("extract_entities", "compliance_check")

    graph.add_conditional_edges(
        "compliance_check",
        route_after_compliance,
        {
            "needs_clarification": "increment_retry",
            "complete":            "generate_followups",
        },
    )
    graph.add_edge("increment_retry", "generate_followups")  # still generate what we have
    graph.add_edge("generate_followups", END)

    return graph.compile()


# Compiled graph — singleton, reused across requests
_graph = build_graph()


# ── Public API called by the router ──────────────────────────────────────────
async def run_parse_agent(text: str, session_id: str | None, rep_id: str) -> ParsedInteractionData:
    initial_state: HCPInteractionState = {
        "raw_text": text,
        "session_id": session_id,
        "rep_id": rep_id,
        "hcp_name": None,
        "hcp_id": None,
        "interaction_type": None,
        "topics_discussed": None,
        "materials_mentioned": [],
        "sentiment": None,
        "sentiment_confidence": None,
        "outcomes": None,
        "suggested_followups": [],
        "clarification_needed": False,
        "clarification_question": None,
        "missing_fields": [],
        "raw_extraction": None,
        "retry_count": 0,
    }

    final_state = await _graph.ainvoke(initial_state)

    return ParsedInteractionData(
        hcp_name=final_state.get("hcp_name"),
        hcp_id=final_state.get("hcp_id"),
        specialty=final_state.get("specialty"),
        hospital=final_state.get("hospital"),
        interaction_type=final_state.get("interaction_type"),
        topics_discussed=final_state.get("topics_discussed"),
        materials_mentioned=final_state.get("materials_mentioned", []),
        sentiment=final_state.get("sentiment"),
        sentiment_confidence=final_state.get("sentiment_confidence"),
        outcomes=final_state.get("outcomes"),
        suggested_followups=final_state.get("suggested_followups", []),
        clarification_needed=final_state.get("clarification_needed", False),
        clarification_question=final_state.get("clarification_question"),
        raw_extraction=final_state.get("raw_extraction"),
    )


async def run_followup_agent(topics: str, outcomes: str, sentiment) -> list[str]:
    """Lightweight call — only the generate_followups node, no full graph."""
    state: HCPInteractionState = {
        "raw_text": "",
        "session_id": None,
        "rep_id": "",
        "hcp_name": None,
        "hcp_id": None,
        "interaction_type": None,
        "topics_discussed": topics,
        "materials_mentioned": [],
        "sentiment": str(sentiment) if sentiment else None,
        "sentiment_confidence": None,
        "outcomes": outcomes,
        "suggested_followups": [],
        "clarification_needed": False,
        "clarification_question": None,
        "missing_fields": [],
        "raw_extraction": None,
        "retry_count": 0,
    }
    result = await generate_followups(state)
    return result.get("suggested_followups", [])