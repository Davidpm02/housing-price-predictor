"""
Incluye la lógica encargada de la normalización de los datos:
 - Conversión de tipos de datos
 - Limpieza básica
 - Normalización de inputs
"""

import pandas as pd
from app.processing.validation import normalize_condition


def preprocess_input(data: dict) -> pd.DataFrame:
    df = pd.DataFrame([data])

    # --- NUMÉRICAS ---
    numeric_cols = [
        "m2_real",
        "room_num",
        "bath_room",
        "floor_number",
        "house_floors"
    ]

    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    # --- BINARIAS ---
    binary_cols = [
        "garage",
        "lift", 
        "terrace", 
        "air_conditioner", 
        "balcony",
        "built_in_wardrobe",
        "chimney",
        "garden",
        "storage_room",
        "swimming_pool"
    ]

    for col in binary_cols:
        if col not in df:
            df[col] = 0
        else:
            df[col] = df[col].fillna(0).astype(int)

    return df