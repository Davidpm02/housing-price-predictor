"""
Contiene lógica dedicada al control de calidad de los datos:
 - Valores fuera de rango
 - Datos faltantes de importancia crítica
 - Inputs inválidos
 - ...
"""

from app.config.features_config import HOUSE_TYPE_FEATURES, CONDITION_FEATURES, PROVINCE_FEATURES
from app.core.logger import get_logger

logger = get_logger(__name__)


def validate_business_rules(data: dict):
    if data["floor_number"] and data["house_floors"]:
        if data["floor_number"] > data["house_floors"]:
            raise ValueError("floor_number cannot be greater than house_floors")

    if data["m2_real"] > 10000:
        raise ValueError("m2_real value is unrealistic")

    # Validamos house_type ∈ lista conocida
    if data["house_type"] not in HOUSE_TYPE_FEATURES:
        raise ValueError(f"house_type value '{data['house_type']}' is not valid")
    logger.info(f"house_type value '{data['house_type']}' is valid")

    # Validamos condition ∈ lista conocida
    if data["condition"] not in CONDITION_FEATURES:
        raise ValueError(f"condition value '{data['condition']}' is not valid")
    logger.info(f"condition value '{data['condition']}' is valid")

    # Validamos province ∈ lista conocida
    if data["province"] not in PROVINCE_FEATURES:
        raise ValueError(f"province value '{data['province']}' is not valid")
    logger.info(f"province value '{data['province']}' is valid")

    return True


def normalize_condition(value: str) -> str:
    if value is None:
        return "unknown"

    value = value.strip().lower()

    mapping = {
        "promoción de obra nueva": "promoción de obra nueva",
        "obra nueva": "promoción de obra nueva",
        "nueva": "promoción de obra nueva",

        "segunda mano/buen estado": "segunda mano/buen estado",
        "segunda mano buen estado": "segunda mano/buen estado",
        "segunda mano / buen estado": "segunda mano/buen estado",

        "segunda mano/para reformar": "segunda mano/para reformar",
        "segunda mano para reformar": "segunda mano/para reformar",
        "reformar": "segunda mano/para reformar",

        "unknown": "unknown"
    }

    return mapping.get(value, "unknown")