"""
test_groq_connection.py
────────────────────────
Tests your GROQ_API_KEY and both models used in this project.
Run this before starting the server to confirm AI layer works.

Usage:
    cd backend
    python test_groq_connection.py
"""

import asyncio
import sys
import json

from dotenv import load_dotenv
load_dotenv()

from app.core.config import settings


async def test_model(model_name: str, prompt: str, label: str):
    from langchain_groq import ChatGroq

    llm = ChatGroq(
        api_key=settings.GROQ_API_KEY,
        model=model_name,
        temperature=0.1,
    )
    try:
        response = await llm.ainvoke(prompt)
        preview = response.content.strip()[:120].replace("\n", " ")
        print(f"  ✓  {label}")
        print(f"     Model   : {model_name}")
        print(f"     Response: {preview}{'...' if len(response.content) > 120 else ''}\n")
        return True
    except Exception as e:
        print(f"  ✗  {label} FAILED")
        print(f"     Model : {model_name}")
        print(f"     Error : {type(e).__name__}: {e}\n")
        return False


async def test_extraction_pipeline():
    """
    Runs a realistic extraction prompt — the same format used by
    the extract_entities node in the LangGraph agent.
    """
    from langchain_groq import ChatGroq

    llm = ChatGroq(
        api_key=settings.GROQ_API_KEY,
        model=settings.GROQ_EXTRACT_MODEL,
        temperature=0.1,
    )

    sample_text = (
        "Met Dr. Anjali Sharma at Apollo Mumbai today. "
        "Discussed OncoPlex 200mg efficacy for HER2+ patients. "
        "She seemed very interested and positive. "
        "Shared the Phase III data brochure."
    )

    prompt = f"""You are extracting structured data from a pharmaceutical rep's visit note.

Input text: "{sample_text}"

Extract and return ONLY valid JSON with these exact keys:
{{
  "hcp_name": "string or null",
  "interaction_type": "Meeting|Phone call|Email|Conference|Remote detail or null",
  "topics_discussed": "string or null",
  "materials_mentioned": ["list of strings"],
  "sentiment": "positive|neutral|negative or null",
  "sentiment_confidence": 0.0-1.0 or null,
  "outcomes": "string or null"
}}"""

    try:
        response = await llm.ainvoke(prompt)
        raw = response.content.strip().removeprefix("```json").removesuffix("```").strip()
        parsed = json.loads(raw)

        print("  ✓  Extraction pipeline test passed")
        print(f"     Input   : \"{sample_text[:60]}...\"")
        print(f"     HCP     : {parsed.get('hcp_name')}")
        print(f"     Sentiment: {parsed.get('sentiment')} "
              f"(confidence: {parsed.get('sentiment_confidence')})")
        print(f"     Topics  : {parsed.get('topics_discussed', '')[:60]}")
        print(f"     Materials: {parsed.get('materials_mentioned')}\n")
        return True

    except json.JSONDecodeError:
        print("  ✗  Extraction pipeline returned invalid JSON")
        print(f"     Raw response: {response.content[:200]}\n")
        return False
    except Exception as e:
        print(f"  ✗  Extraction pipeline FAILED: {e}\n")
        return False


async def main():
    print(f"\n{'─'*55}")
    print("  PharmaConnect CRM — Groq API Connection Test")
    print(f"{'─'*55}")

    key = settings.GROQ_API_KEY
    masked = key[:8] + "..." + key[-4:] if len(key) > 12 else "NOT SET"
    print(f"  API Key : {masked}")
    print(f"  Extract : {settings.GROQ_EXTRACT_MODEL}")
    print(f"  Followup: {settings.GROQ_FOLLOWUP_MODEL}")
    print(f"{'─'*55}\n")

    if not key or key.startswith("gsk_xx"):
        print("  ✗  GROQ_API_KEY is not set in .env\n")
        print("  Steps to get your key:")
        print("  1. Go to  https://console.groq.com/keys")
        print("  2. Sign up / log in (free)")
        print("  3. Click 'Create API Key'")
        print("  4. Copy the key (starts with gsk_)")
        print("  5. Paste it into .env as GROQ_API_KEY=gsk_...\n")
        sys.exit(1)

    results = []

    # Test 1: gemma2-9b-it (extraction model)
    results.append(await test_model(
        model_name=settings.GROQ_EXTRACT_MODEL,
        prompt="Reply with only the word CONNECTED.",
        label=f"Model 1 — {settings.GROQ_EXTRACT_MODEL}",
    ))

    # Test 2: llama-3.3-70b-versatile (follow-up model)
    results.append(await test_model(
        model_name=settings.GROQ_FOLLOWUP_MODEL,
        prompt="Reply with only the word CONNECTED.",
        label=f"Model 2 — {settings.GROQ_FOLLOWUP_MODEL}",
    ))

    # Test 3: full extraction pipeline
    print(f"{'─'*55}")
    print("  Running realistic extraction pipeline test...\n")
    results.append(await test_extraction_pipeline())

    print(f"{'─'*55}")
    if all(results):
        print("  All Groq tests passed. AI layer is ready.")
    else:
        print("  Some tests failed. Check errors above.")
        print("\n  Common fixes:")
        print("  • Invalid key  → regenerate at console.groq.com/keys")
        print("  • Rate limited → wait 60s and retry (free tier: 30 RPM)")
        print("  • Wrong model  → check GROQ_EXTRACT_MODEL in .env")
    print(f"{'─'*55}\n")

    if not all(results):
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())