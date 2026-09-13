from fastapi import APIRouter, Query, HTTPException
from app.db.repository import (
    get_properties,
    get_property_by_id,
    count_by_province,
    count_by_ccaa
)

from app.schemas.property import PropertyListItem, PropertyDetail
from app.schemas.aggregation import ProvinceCount, CCAACount

router = APIRouter()


@router.get("/", response_model=list[PropertyListItem])
def list_properties(
    limit: int = Query(20, le=100),
    offset: int = Query(0),
    province: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
):
    return get_properties(
        limit=limit,
        offset=offset,
        province=province,
        min_price=min_price,
        max_price=max_price,
    )


@router.get("/count/province", response_model=list[ProvinceCount])
def get_count_by_province():
    return count_by_province()


@router.get("/count/ccaa", response_model=list[CCAACount])
def get_count_by_ccaa():
    return count_by_ccaa()


@router.get("/{property_id}", response_model=PropertyDetail)
def get_property(property_id: int):
    property_data = get_property_by_id(property_id)

    if not property_data:
        raise HTTPException(status_code=404, detail="Property not found")

    return property_data