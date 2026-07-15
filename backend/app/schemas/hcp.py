from uuid import UUID
from pydantic import BaseModel
from typing import Optional


class HCPSearchResult(BaseModel):
    id: UUID
    name: str
    specialty: str
    hospital: str
    territory: Optional[str] = None
    city: Optional[str] = None

    class Config:
        from_attributes = True


class MaterialOut(BaseModel):
    id: UUID
    name: str
    category: Optional[str] = None
    version: Optional[str] = None

    class Config:
        from_attributes = True


class SampleOut(BaseModel):
    id: UUID
    product_name: str
    dosage: Optional[str] = None
    unit: Optional[str] = None

    class Config:
        from_attributes = True