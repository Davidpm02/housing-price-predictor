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


def get_property_by_id(property_id: int):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT * FROM properties
        WHERE id = ?
    """, (property_id,))

    row = cursor.fetchone()
    conn.close()

    return dict(row) if row else None


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