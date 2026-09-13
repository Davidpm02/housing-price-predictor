from app.db.database import get_connection

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
    min_price: float | None = None,
    max_price: float | None = None,
):
    conn = get_connection()
    cursor = conn.cursor()

    query = """
        SELECT house_id, city, province, price, m2_real, room_num, house_type, full_location
        FROM properties
        WHERE 1=1
    """

    params = []

    if province:
        query += " AND province = ?"
        params.append(province)

    if min_price:
        query += " AND price >= ?"
        params.append(min_price)

    if max_price:
        query += " AND price <= ?"
        params.append(max_price)

    query += " LIMIT ? OFFSET ?"
    params.extend([limit, offset])

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]


def get_property_by_id(property_id: int):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT * FROM properties
        WHERE house_id = ?
    """, (property_id,))

    row = cursor.fetchone()
    conn.close()

    return dict(row) if row else None


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