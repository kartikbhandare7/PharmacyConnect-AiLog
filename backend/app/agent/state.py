from typing import TypedDict, Optional, Any


class HCPInteractionState(TypedDict):
    # Input
    raw_text: str
    session_id: Optional[str]
    rep_id: str

    # Extracted fields
    hcp_name: Optional[str]
    hcp_id: Optional[str]
    interaction_type: Optional[str]
    topics_discussed: Optional[str]
    materials_mentioned: list[str]
    sentiment: Optional[str]
    sentiment_confidence: Optional[float]
    outcomes: Optional[str]
    suggested_followups: list[str]

    # Control flow
    clarification_needed: bool
    clarification_question: Optional[str]
    missing_fields: list[str]
    raw_extraction: Optional[dict[str, Any]]

    # Internal
    retry_count: int