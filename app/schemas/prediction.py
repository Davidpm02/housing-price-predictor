"""
Define el contrato de datos para la aplicación.
 - Lista de features esperadas
 - Tipo de cada feature
 - Si es obligatoria
 - Valores posibles (categorías)
"""

from pydantic import BaseModel, Field
from typing import Optional, Literal


class PredictionInput(BaseModel):
    # numéricas
    m2_real: int = Field(..., gt=0)
    room_num: int = Field(..., ge=0)
    bath_num: int = Field(..., ge=0)

    house_floors: Optional[int] = None
    floor_number: Optional[int] = None

    # categóricas
    province: str

    house_type: str
    condition: Literal[
        "promoción de obra nueva",
        "segunda mano/buen estado",
        "segunda mano/para reformar",
        "unknown"
    ]

    # binarios
    garage: int = 0
    lift: int = 0
    terrace: int = 0
    air_conditioner: int = 0
    balcony: int = 0
    built_in_wardrobe: int = 0
    chimney: int = 0
    garden: int = 0
    storage_room: int = 0
    swimming_pool: int = 0