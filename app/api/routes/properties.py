from fastapi import APIRouter, Query
from app.db.repository import get_properties_paginated
from app.schemas.property import PropertyListItem

router = APIRouter()


@router.get("/", response_model=list[PropertyListItem])
def list_properties(
    limit: int = Query(20, le=100),
    offset: int = Query(0)
):
    return get_properties_paginated(limit=limit, offset=offset)