from fastapi import APIRouter, Depends, Query # type: ignore
from sqlalchemy.ext.asyncio import AsyncSession # type: ignore
from sqlalchemy import select, or_ # type: ignore
from app.db.session import get_db
from app.models.hcp import HCP
from app.models.materials import Material, Sample
from app.schemas.hcp import HCPSearchResult, MaterialOut, SampleOut
from app.models.user import User
from app.routers.deps import get_current_user

router = APIRouter(tags=["hcps"])


@router.get("/hcps/search", response_model=list[HCPSearchResult])
async def search_hcps(
    q: str = Query("", description="Filter by name, specialty, or hospital"),
    limit: int = Query(20, le=50),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = select(HCP).where(HCP.is_active == True)
    if q:
        pattern = f"%{q}%"
        query = query.where(
            or_(
                HCP.name.ilike(pattern),
                HCP.specialty.ilike(pattern),
                HCP.hospital.ilike(pattern),
            )
        )
    result = await db.execute(query.order_by(HCP.name).limit(limit))
    return result.scalars().all()




@router.get("/materials/search", response_model=list[MaterialOut])
async def search_materials(
    q: str = Query("", description="Filter by name"),
    limit: int = Query(20, le=50),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = select(Material).where(Material.is_active == True)
    if q:
        query = query.where(Material.name.ilike(f"%{q}%"))
    result = await db.execute(query.order_by(Material.name).limit(limit))
    return result.scalars().all()


@router.get("/samples/search", response_model=list[SampleOut])
async def search_samples(
    q: str = Query("", description="Filter by product name"),
    limit: int = Query(20, le=50),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = select(Sample).where(Sample.is_active == True)
    if q:
        query = query.where(Sample.product_name.ilike(f"%{q}%"))
    result = await db.execute(query.order_by(Sample.product_name).limit(limit))
    return result.scalars().all()