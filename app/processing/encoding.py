"""
Encargado del encoding de las variables categóricas, y de llevar a cabo un mapping consistente.
"""

from app.config.features_config import FEATURES_ORDER
import pandas as pd

from app.core.logger import get_logger

logger = get_logger(__name__)



def _build_one_hot(df: pd.DataFrame, base_col: str, feature_prefix: str):
    """
    Construye one-hot encoding basado en FEATURES_ORDER.
    """

    # columnas esperadas en el modelo
    expected_cols = [
        col for col in FEATURES_ORDER if col.startswith(feature_prefix)
    ]

    if base_col not in df:
        raise ValueError(f"Missing column: {base_col}")
    logger.info(f"Encoding column: {base_col}")

    for col in expected_cols:
        category_value = col.replace(feature_prefix, "")
        df[col] = (df[base_col] == category_value).astype(int)

    # validación: al menos una activa
    if df[expected_cols].sum(axis=1).eq(0).any():
        raise ValueError(f"Invalid value in {base_col}")

    return df


def encode_categorical(df: pd.DataFrame) -> pd.DataFrame:
    """
    Aplica encoding one-hot alineado con el modelo.
    """

    # =========================
    # HOUSE TYPE
    # =========================
    df = _build_one_hot(df, base_col="house_type", feature_prefix="house_type_")

    # =========================
    # CONDITION
    # =========================
    df = _build_one_hot(df, base_col="condition", feature_prefix="condition_")

    # =========================
    # PROVINCE
    # =========================
    df = _build_one_hot(df, base_col="province", feature_prefix="province_")

    return df