from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.hcp import HCP


async def find_hcp(db: AsyncSession, name: str):
    if not name:
        return None

    result = await db.execute(
        select(HCP).where(
            func.lower(HCP.name) == func.lower(name)
        )
    )

    return result.scalar_one_or_none()