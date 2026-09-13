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

class PropertyDetail(BaseModel):
    house_id: int
    ad_description: str | None
    price: float
    m2_real: int
    room_num: float | None
    bath_num: float | None
    house_type: str
    condition: str | None
    city: str
    province: str
    ccaa: str
    full_location: str
    garage: str | None
    terrace: int | None
    lift: float | None
    swimming_pool: int | None