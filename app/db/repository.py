from app.db.database import get_connection

# Normalización de house_type para el API (los datos en BD contienen espacios
# y prefijos de alquiler que no coinciden con las categorías del modelo).
def normalize_house_type(raw):
    if raw is None:
        return "Otros"
    value = raw.strip().lower()
    if value in ("alquiler de casa o chalet independiente", "casa o chalet independiente"):
        return "Casa o chalet independiente"
    if value in ("alquiler de casa o chalet", "casa o chalet"):
        return "Casa o chalet"
    if value in ("alquiler de chalet adosado", "chalet adosado"):
        return "Chalet adosado"
    if value in ("alquiler de chalet pareado", "chalet pareado"):
        return "Chalet pareado"
    if value in ("alquiler de casa de pueblo", "casa de pueblo"):
        return "Casa de pueblo"
    if value in ("alquiler de casa rural", "casa rural"):
        return "Casa rural"
    if value in ("alquiler de finca rústica", "finca rústica"):
        return "Finca rústica"
    if value in ("alquiler de ático", "ático"):
        return "Ático"
    if value in ("alquiler de piso", "piso"):
        return "Piso"
    if value in ("alquiler de dúplex", "dúplex"):
        return "Dúplex"
    if value in ("alquiler de estudio", "estudio"):
        return "Estudio"

    # Tipos no contemplados por el modelo => "Otros"
    if value in ("caserón", "palacio", "torre", "alquiler de caserón", "alquiler de palacio", "alquiler de torre"):
        return "Otros"

    return raw.strip() or "Otros"


# Variantes en BD (LOWER(TRIM(col))) que normalizan a cada tipo de vivienda.
HOUSE_TYPE_VARIANTS: dict[str, list[str]] = {
    "Casa de pueblo": ["casa de pueblo", "alquiler de casa de pueblo"],
    "Casa o chalet": ["casa o chalet", "alquiler de casa o chalet"],
    "Casa o chalet independiente": ["casa o chalet independiente", "alquiler de casa o chalet independiente"],
    "Casa rural": ["casa rural", "alquiler de casa rural"],
    "Chalet adosado": ["chalet adosado", "alquiler de chalet adosado"],
    "Chalet pareado": ["chalet pareado", "alquiler de chalet pareado"],
    "Dúplex": ["dúplex", "alquiler de dúplex"],
    "Estudio": ["estudio", "alquiler de estudio"],
    "Finca rústica": ["finca rústica", "alquiler de finca rústica"],
    "Otros": ["caserón", "palacio", "torre", "alquiler de caserón"],
    "Piso": ["piso", "alquiler de piso"],
    "Ático": ["ático", "alquiler de ático"],
}

# Amenities filtrables: columna en BD por clave, con su condición SQL.
AMENITY_FILTERS: dict[str, str] = {
    "garage": "garage IS NOT NULL AND TRIM(garage) <> ''",
    "lift": "lift = 1",
    "terrace": "terrace = 1",
    "balcony": "balcony = 1",
    "air_conditioner": "air_conditioner = 1",
    "built_in_wardrobe": "built_in_wardrobe = 1",
    "chimney": "chimney = 1",
    "garden": "garden = 1",
    "storage_room": "storage_room = 1",
    "swimming_pool": "swimming_pool = 1",
    "reduced_mobility": "reduced_mobility = 1",
}


def get_all_properties(limit: int = 100):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT * FROM properties
        LIMIT ?
    """, (limit,))

    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]


from app.db.database import get_connection


def get_properties(
    limit: int = 20,
    offset: int = 0,
    province: str | None = None,
    ccaa: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    min_m2: int | None = None,
    min_rooms: float | None = None,
    min_baths: float | None = None,
    house_types: list[str] | None = None,
    conditions: list[str] | None = None,
    amenities: list[str] | None = None,
):
    conn = get_connection()
    cursor = conn.cursor()

    where = ["1=1"]
    params = []

    if province:
        where.append("LOWER(province) = LOWER(?)")
        params.append(province)

    if ccaa:
        where.append("ccaa = ?")
        params.append(ccaa)

    if min_price:
        where.append("price >= ?")
        params.append(min_price)

    if max_price:
        where.append("price <= ?")
        params.append(max_price)

    if min_m2:
        where.append("m2_real >= ?")
        params.append(min_m2)

    if min_rooms:
        where.append("room_num >= ?")
        params.append(min_rooms)

    if min_baths:
        where.append("bath_num >= ?")
        params.append(min_baths)

    if house_types:
        variants: list[str] = []
        for t in house_types:
            variants.extend(HOUSE_TYPE_VARIANTS.get(t, []))
        if variants:
            placeholders = ",".join("?" for _ in variants)
            where.append(f"LOWER(TRIM(house_type)) IN ({placeholders})")
            params.extend(variants)

    if conditions:
        placeholders = ",".join("?" for _ in conditions)
        where.append(f"condition IN ({placeholders})")
        params.extend(conditions)

    if amenities:
        for a in amenities:
            sql = AMENITY_FILTERS.get(a)
            if sql:
                where.append(sql)

    where_sql = " AND ".join(where)

    cursor.execute(f"SELECT COUNT(*) FROM properties WHERE {where_sql}", params)
    total = cursor.fetchone()[0]

    query = f"""
        SELECT house_id, city, province, price, m2_real, room_num, house_type, full_location
        FROM properties
        WHERE {where_sql}
    """
    query += " LIMIT ? OFFSET ?"
    params_ext = params + [limit, offset]

    cursor.execute(query, params_ext)
    rows = cursor.fetchall()
    conn.close()

    items = [dict(row) for row in rows]
    for item in items:
        item["house_type"] = normalize_house_type(item.get("house_type"))
        if item.get("full_location"):
            item["full_location"] = item["full_location"].strip()
        if item.get("city"):
            item["city"] = item["city"].strip()

    return items, total


def get_property_by_id(property_id: int):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT * FROM properties
        WHERE house_id = ?
    """, (property_id,))

    row = cursor.fetchone()
    conn.close()

    if not row:
        return None

    item = dict(row)
    item["house_type"] = normalize_house_type(item.get("house_type"))
    for field in ("full_location", "city", "condition", "ad_description"):
        if item.get(field):
            item[field] = str(item[field]).strip()
    return item


def count_by_province():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT province, COUNT(*) as total
        FROM properties
        GROUP BY province
        ORDER BY total DESC
    """)

    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]


def count_by_ccaa():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT ccaa, COUNT(*) as total
        FROM properties
        GROUP BY ccaa
        ORDER BY total DESC
    """)

    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]


def get_properties_by_filters(
    city: str = None,
    min_price: float = None,
    max_price: float = None,
    min_m2: int = None
):
    conn = get_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM properties WHERE 1=1"
    params = []

    if city:
        query += " AND city = ?"
        params.append(city)

    if min_price:
        query += " AND price >= ?"
        params.append(min_price)

    if max_price:
        query += " AND price <= ?"
        params.append(max_price)

    if min_m2:
        query += " AND m2_real >= ?"
        params.append(min_m2)

    cursor.execute(query, params)

    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]