import pandas as pd
from app.db.database import get_connection, init_db


DATASET_PATH = "data/spanish_housing_clean.csv"


# Mapping de provincias del dataset a CCAA
PROVINCE_TO_CCAA = {
    "A Coruña": "Galicia",
    "Albacete": "Castilla-La Mancha",
    "Alicante": "Comunitat Valenciana",
    "Balears (Illes)": "Illes Balears",
    "Barcelona": "Cataluña",
    "Ciudad Real": "Castilla-La Mancha",
    "Cádiz": "Andalucía",
    "Girona": "Cataluña",
    "Guipúzcoa": "País Vasco",
    "Huelva": "Andalucía",
    "Madrid": "Comunidad de Madrid",
    "Santa Cruz De Tenerife": "Canarias",
    "Segovia": "Castilla y León",
    "Sevilla": "Andalucía",
    "Soria": "Castilla y León",
    "Tarragona": "Cataluña",
    "Valladolid": "Castilla y León",
    "València": "Comunitat Valenciana",
    "Vizcaya": "País Vasco",
    "Zamora": "Castilla y León",
    "Álava": "País Vasco"
}

def clean_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    df = df.rename(columns={
        "loc_city": "city",
        "loc_district": "district",
        "loc_neigh": "neighborhood",
        "loc_full": "full_location",
        "loc_zone": "zone",
        "companies_prov_vs_national_%": "companies_prov_vs_national_pct",
        "population_prov_vs_national_%": "population_prov_vs_national_pct"
    })

    # SOLO hacemos casteos seguros
    numeric_cols = [
        "m2_real", "m2_useful", "room_num", "bath_num",
        "price", "log_price", "price_per_m2",
        "population_prov", "renta_media_prov",
        "total_rooms"
    ]

    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    return df


def seed_database():
    print("📥 Loading dataset...")

    df = pd.read_csv(DATASET_PATH)

    df = clean_dataframe(df)

    print(f"Dataset shape: {df.shape}")

    conn = get_connection()

    columns = [
        "house_id", "ad_description", "ad_last_update",
        "city", "district", "neighborhood", "full_location", "zone",
        "m2_real", "m2_useful", "room_num", "bath_num",
        "house_type", "condition", "floor",
        "price", "log_price", "price_per_m2",
        "garage", "lift", "terrace", "balcony",
        "built_in_wardrobe", "chimney", "garden",
        "storage_room", "swimming_pool", "air_conditioner",
        "reduced_mobility",
        "energetic_certif",
        "number_of_companies_prov", "population_prov", "renta_media_prov"
    ]

    df = df[columns]

    # Inferimos las columnas "province" y "ccaa" a partir de la columna "zone"
    df["province"] = df["zone"].apply(extract_province_from_zone)
    df["province"] = df["province"].str.strip().str.title()

    df["ccaa"] = df["province"].map(PROVINCE_TO_CCAA)

    df.to_sql("properties", conn, if_exists="replace", index=False)

    conn.close()

    print("✅ Database seeded successfully")


def extract_province_from_zone(zone: str) -> str | None:
    if not isinstance(zone, str):
        return None

    parts = [p.strip() for p in zone.split(",") if p.strip()]

    if len(parts) == 0:
        return None

    if len(parts) >= 2:
        return parts[-1]  # último elemento → provincia

    return parts[0] # Si solo hay un elemento, asumimos que es la provincia


if __name__ == "__main__":
    init_db()
    seed_database()