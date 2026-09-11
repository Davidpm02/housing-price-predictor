import pandas as pd
from app.core.logger import get_logger

logger = get_logger(__name__)

# Este diccionario se podrá sustituir por llamadas a una base de datos cuando
# se haya creado. Por el momento, se mantiene hardcoded.
PROVINCE_POPULATION = {
    "A Coruña": 1119351,
    "Albacete": 388786,
    "Alicante": 1838819,
    "Balears (Illes)": 1128908,
    "Barcelona": 5609350,
    "Ciudad Real": 499100,
    "Cádiz": 1238714,
    "Girona": 761947,
    "Guipúzcoa": 720592,
    "Huelva": 519932,
    "Madrid": 6578079,
    "Santa Cruz de Tenerife": 1018510,
    "Segovia": 153342,
    "Sevilla": 1939887,
    "Soria": 88600,
    "Tarragona": 519851,
    "Valladolid": 519851,
    "València": 2547986,
    "Vizcaya": 1149628,
    "Zamora": 174549,
    "Álava": 328868
}


def create_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Genera features derivadas y externas necesarias para el modelo.
    """

    # =========================
    # FEATURE EXTERNA
    # =========================
    if "province" not in df:
        raise ValueError("Province is required to map population_prov")

    df["population_prov"] = df["province"].map(PROVINCE_POPULATION)

    # Validación
    if df["population_prov"].isnull().any():
        unknown_values = df.loc[df["population_prov"].isnull(), "province"].unique()
        raise ValueError(f"Unknown province for population mapping: {unknown_values}")
    logger.info("Feature 'population_prov' created")

    return df