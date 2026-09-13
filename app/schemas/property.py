from pydantic import BaseModel


class PropertyListItem(BaseModel):
    house_id: int
    city: str
    price: float
    m2_real: int
    room_num: float | None
    house_type: str
    full_location: str