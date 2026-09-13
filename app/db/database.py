import sqlite3
from pathlib import Path

DB_PATH = Path("data/properties.db")


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # dict-like rows
    return conn


def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS properties (
        id INTEGER PRIMARY KEY,

        house_id INTEGER,

        ad_description TEXT,
        ad_last_update TEXT,

        city TEXT,
        district TEXT,
        neighborhood TEXT,
        full_location TEXT,
        zone TEXT,
        province TEXT,
        ccaa TEXT,

        m2_real INTEGER,
        m2_useful REAL,
        room_num REAL,
        bath_num REAL,

        house_type TEXT,
        condition TEXT,
        floor TEXT,

        price REAL,
        log_price REAL,
        price_per_m2 REAL,

        garage TEXT,
        lift REAL,
        terrace INTEGER,
        balcony INTEGER,
        built_in_wardrobe INTEGER,
        chimney INTEGER,
        garden INTEGER,
        storage_room INTEGER,
        swimming_pool INTEGER,
        air_conditioner INTEGER,

        reduced_mobility INTEGER,

        energetic_certif TEXT,

        number_of_companies_prov INTEGER,
        population_prov INTEGER,
        renta_media_prov REAL,

        companies_prov_vs_national_pct REAL,
        population_prov_vs_national_pct REAL,

        total_rooms REAL,
        obtention_date TEXT
    )
    """)

    conn.commit()
    conn.close()