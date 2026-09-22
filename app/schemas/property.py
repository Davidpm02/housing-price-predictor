from pydantic import BaseModel


class PropertyListItem(BaseModel):
    house_id: int
    city: str
    province: str
    price: float
    m2_real: int
    room_num: float | None
    house_type: str
    full_location: str

class PropertiesPage(BaseModel):
    items: list[PropertyListItem]
    total: int

class PropertyDetail(BaseModel):
    house_id: int
    ad_description: str | None
    ad_last_update: str | None
    price: float
    price_per_m2: float | None
    m2_real: int
    m2_useful: float | None
    room_num: float | None
    bath_num: float | None
    house_type: str
    condition: str | None
    floor: str | None
    city: str
    district: str | None
    neighborhood: str | None
    province: str
    ccaa: str
    zone: str | None
    full_location: str
    garage: str | None
    terrace: int | None
    balcony: int | None
    lift: float | None
    built_in_wardrobe: int | None
    chimney: int | None
    garden: int | None
    storage_room: int | None
    swimming_pool: int | None
    air_conditioner: int | None
    reduced_mobility: int | None
    energetic_certif: str | None