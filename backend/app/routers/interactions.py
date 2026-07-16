from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status  # type: ignore
from sqlalchemy.ext.asyncio import AsyncSession # type: ignore
from sqlalchemy import select # type: ignore
from app.db.session import get_db
from app.models.user import User
from app.models.interaction import Interaction, InteractionMaterial, InteractionSample
from app.schemas.interaction import (
    InteractionCreate,
    InteractionOut,
    ParseRequest,
    ParsedInteractionData,
    FollowupSuggestionsOut,
)
from app.models.hcp import HCP
from app.routers.deps import get_current_user
from app.agent.graph import run_parse_agent, run_followup_agent

router = APIRouter(prefix="/interactions", tags=["interactions"])


# ── POST /interactions/parse ──────────────────────────────────────────────────
# @router.post("/parse", response_model=ParsedInteractionData)
@router.post("/parse", response_model=ParsedInteractionData)
async def parse_interaction(
    payload: ParseRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    result = await run_parse_agent(
        text=payload.text,
        session_id=payload.session_id,
        rep_id=str(current_user.id),
    )

    # Search the HCP table using the extracted doctor name
    if result.hcp_name:

        db_result = await db.execute(
            select(HCP).where(HCP.name.ilike(result.hcp_name))
        )

        hcp = db_result.scalar_one_or_none()

        if hcp:
            result.hcp_id = str(hcp.id)
            result.specialty = hcp.specialty
            result.hospital = hcp.hospital

    return result



# ── POST /interactions ────────────────────────────────────────────────────────
@router.post("", response_model=InteractionOut, status_code=status.HTTP_201_CREATED)
async def create_interaction(
    payload: InteractionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Submits a completed interaction record.
    Writes the interaction row plus junction rows for materials and samples.
    """
    interaction = Interaction(
        hcp_id=payload.hcp_id,
        rep_id=current_user.id,
        interaction_type=payload.interaction_type,
        interaction_date=payload.interaction_date,
        interaction_time=payload.interaction_time,
        attendees=payload.attendees,
        topics_discussed=payload.topics_discussed,
        sentiment=payload.sentiment,
        sentiment_confidence=payload.sentiment_confidence,
        outcomes=payload.outcomes,
        follow_up_actions=payload.follow_up_actions,
        ai_suggested_followups=payload.ai_suggested_followups,
        ai_extracted_data=payload.ai_extracted_data,
        status="submitted",
    )
    db.add(interaction)
    await db.flush()  # get interaction.id before inserting junction rows

    for m in payload.materials_shared:
        db.add(InteractionMaterial(interaction_id=interaction.id, material_id=m.material_id))

    for s in payload.samples_distributed:
        db.add(InteractionSample(
            interaction_id=interaction.id,
            sample_id=s.sample_id,
            quantity=s.quantity,
        ))

    await db.commit()
    await db.refresh(interaction)
    return interaction


# ── GET /interactions/{id} ────────────────────────────────────────────────────
@router.get("/{interaction_id}", response_model=InteractionOut)
async def get_interaction(
    interaction_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Interaction).where(
            Interaction.id == interaction_id,
            Interaction.rep_id == current_user.id,   # reps can only read their own
        )
    )
    interaction = result.scalar_one_or_none()
    if not interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")
    return interaction


# ── POST /interactions/{id}/followups ─────────────────────────────────────────
@router.post("/{interaction_id}/followups", response_model=FollowupSuggestionsOut)
async def regenerate_followups(
    interaction_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Re-runs the follow-up generation node (llama-3.3-70b) for an existing interaction.
    Useful when the rep wants fresh suggestions.
    """
    result = await db.execute(
        select(Interaction).where(Interaction.id == interaction_id)
    )
    interaction = result.scalar_one_or_none()
    if not interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")

    suggestions = await run_followup_agent(
        topics=interaction.topics_discussed,
        outcomes=interaction.outcomes or "",
        sentiment=interaction.sentiment,
    )

    # Persist updated suggestions
    interaction.ai_suggested_followups = suggestions
    await db.commit()

    return FollowupSuggestionsOut(interaction_id=interaction_id, suggestions=suggestions)