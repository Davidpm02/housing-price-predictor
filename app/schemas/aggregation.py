from pydantic import BaseModel


class ProvinceCount(BaseModel):
    province: str
    total: int


class CCAACount(BaseModel):
    ccaa: str
    total: int