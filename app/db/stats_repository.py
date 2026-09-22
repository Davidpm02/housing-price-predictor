"""Agregaciones para el dashboard de estadísticas e insights del dataset."""

from app.db.database import get_connection
from app.db.repository import normalize_house_type

AMENITY_LABELS = [
    ("terrace", "Terraza"),
    ("swimming_pool", "Piscina"),
    ("garden", "Jardín"),
    ("balcony", "Balcón"),
    ("air_conditioner", "Aire acondicionado"),
    ("storage_room", "Trastero"),
    ("lift", "Ascensor"),
    ("built_in_wardrobe", "Armarios empotrados"),
    ("chimney", "Chimenea"),
    ("garage", "Garaje"),
    ("reduced_mobility", "Movilidad reducida"),
]

CONDITION_LABELS = {
    "segunda mano/buen estado": "Segunda mano · buen estado",
    "segunda mano/para reformar": "Segunda mano · reformar",
    "promoción de obra nueva": "Obra nueva",
}

# Rango "sano" de precios y superficies para las visualizaciones
_MIN_PRICE = 20000
_MAX_PRICE = 2000000
_MIN_M2 = 15
_MAX_M2 = 800


def _base_where():
    return f"price BETWEEN {_MIN_PRICE} AND {_MAX_PRICE} AND m2_real BETWEEN {_MIN_M2} AND {_MAX_M2}"


def get_summary_stats():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(f"""
        SELECT COUNT(*) AS total,
               ROUND(AVG(price)) AS avg_price,
               ROUND(AVG(price_per_m2)) AS avg_price_per_m2,
               ROUND(AVG(m2_real)) AS avg_m2,
               ROUND(AVG(room_num), 1) AS avg_rooms,
               ROUND(AVG(bath_num), 1) AS avg_baths
        FROM properties
        WHERE {_base_where()}
    """)
    row = dict(cursor.fetchone())

    cursor.execute("SELECT COUNT(DISTINCT province) FROM properties")
    row["total_provinces"] = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(DISTINCT ccaa) FROM properties")
    row["total_ccaas"] = cursor.fetchone()[0]

    cursor.execute(f"SELECT COUNT(*) FROM properties WHERE {_base_where()}")
    row["total_all"] = cursor.fetchone()[0]

    conn.close()
    return row


def get_house_type_stats():
    """Recuento y precios medios agrupados por tipo de vivienda normalizado."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(f"""
        SELECT house_type,
               COUNT(*) AS total,
               AVG(price) AS avg_price,
               AVG(price_per_m2) AS avg_price_per_m2,
               AVG(m2_real) AS avg_m2
        FROM properties
        WHERE {_base_where()}
        GROUP BY house_type
    """)
    rows = cursor.fetchall()
    conn.close()

    grouped: dict[str, dict] = {}
    for r in rows:
        d = dict(r)
        t = normalize_house_type(d.get("house_type"))
        acc = grouped.setdefault(
            t,
            {
                "house_type": t,
                "total": 0,
                "avg_price": 0.0,
                "avg_price_per_m2": 0.0,
                "avg_m2": 0.0,
            },
        )
        acc["total"] += d["total"]
        acc["avg_price"] += d["avg_price"] * d["total"]
        acc["avg_price_per_m2"] += d["avg_price_per_m2"] * d["total"]
        acc["avg_m2"] += d["avg_m2"] * d["total"]

    result = []
    for acc in grouped.values():
        n = acc["total"]
        acc["avg_price"] = round(acc["avg_price"] / n)
        acc["avg_price_per_m2"] = round(acc["avg_price_per_m2"] / n)
        acc["avg_m2"] = round(acc["avg_m2"] / n, 1)
        result.append(acc)

    result.sort(key=lambda x: x["total"], reverse=True)
    return result


def get_province_stats():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(f"""
        SELECT province,
               COUNT(*) AS total,
               AVG(price) AS avg_price,
               AVG(price_per_m2) AS avg_price_per_m2,
               AVG(m2_real) AS avg_m2
        FROM properties
        WHERE {_base_where()}
        GROUP BY province
        ORDER BY avg_price DESC
    """)
    rows = cursor.fetchall()
    conn.close()
    result = []
    for r in rows:
        d = dict(r)
        d["avg_price"] = round(d["avg_price"])
        d["avg_price_per_m2"] = round(d["avg_price_per_m2"])
        d["avg_m2"] = round(d["avg_m2"], 1)
        result.append(d)
    return result


def get_price_distribution():
    """Histograma de precios usando pasos de 25.000 € hasta el techo sano."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(f"""
        SELECT price FROM properties
        WHERE {_base_where()}
    """)
    prices = [r[0] for r in cursor.fetchall()]
    conn.close()

    step = 25000
    max_cap = 1000000  # las siguientes entran en el último bucket
    buckets: dict[int, int] = {}
    for p in prices:
        key = min(int(p // step) * step, max_cap)
        buckets[key] = buckets.get(key, 0) + 1

    ordered = sorted(buckets.keys())
    return [
        {
            "min": int(k),
            "max": max_cap if k == max_cap else int(k + step),
            "label": f"{int(k):,}" + ("+" if k == max_cap else f"–{int(k + step):,}"),
            "count": buckets[k],
        }
        for k in ordered
    ]


def get_scatter_sample(n: int = 2000):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(f"""
        SELECT price, m2_real, room_num, bath_num, price_per_m2, house_type
        FROM properties
        WHERE {_base_where()}
        ORDER BY RANDOM()
        LIMIT ?
    """, (n,))
    rows = cursor.fetchall()
    conn.close()
    result = []
    for r in rows:
        d = dict(r)
        d["price"] = round(d["price"])
        d["price_per_m2"] = round(d["price_per_m2"])
        d["house_type"] = normalize_house_type(d.get("house_type"))
        result.append(d)
    return result


def get_amenity_stats():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(f"SELECT COUNT(*) FROM properties WHERE {_base_where()}")
    total = cursor.fetchone()[0]

    result = []
    for col, label in AMENITY_LABELS:
        condition = (
            "garage IS NOT NULL AND TRIM(garage) <> ''"
            if col == "garage"
            else f"{col} = 1"
        )
        cursor.execute(
            f"SELECT COUNT(*) FROM properties WHERE {_base_where()} AND {condition}"
        )
        count = cursor.fetchone()[0]
        result.append(
            {
                "key": col,
                "label": label,
                "count": count,
                "pct": round(count * 100 / total, 1),
            }
        )
    conn.close()

    result.sort(key=lambda x: x["pct"], reverse=True)
    return {"total": total, "items": result}


def get_condition_stats():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(f"""
        SELECT condition, COUNT(*) AS total
        FROM properties
        WHERE {_base_where()} AND condition IS NOT NULL AND condition <> ''
        GROUP BY condition
    """)
    rows = cursor.fetchall()
    conn.close()

    result = []
    for r in rows:
        d = dict(r)
        d["label"] = CONDITION_LABELS.get(d["condition"], d["condition"])
        result.append(d)
    result.sort(key=lambda x: x["total"], reverse=True)
    return result


def get_m2_buckets():
    """Tendencia precio/m² por tramos de superficie (precio·m² vs superficie)."""
    buckets_def = [
        (15, 40, "< 40"),
        (40, 60, "40–60"),
        (60, 80, "60–80"),
        (80, 100, "80–100"),
        (100, 125, "100–125"),
        (125, 150, "125–150"),
        (150, 200, "150–200"),
        (200, 300, "200–300"),
        (300, 800, "300+"),
    ]
    conn = get_connection()
    cursor = conn.cursor()
    result = []
    for lo, hi, label in buckets_def:
        cursor.execute(
            f"""
            SELECT COUNT(*), AVG(price), AVG(price_per_m2)
            FROM properties
            WHERE {_base_where()} AND m2_real >= ? AND m2_real < ?
            """,
            (lo, hi),
        )
        count, avg_price, avg_ppm = cursor.fetchone()
        result.append(
            {
                "bucket": label,
                "count": count,
                "avg_price": round(avg_price) if avg_price else 0,
                "avg_price_per_m2": round(avg_ppm) if avg_ppm else 0,
            }
        )
    conn.close()
    return result


def get_province_type_counts():
    """Recuento de viviendas por provincia y tipo (para gráfico interactivo)."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(f"""
        SELECT province, house_type, COUNT(*) AS total
        FROM properties
        WHERE {_base_where()}
        GROUP BY province, house_type
    """)
    rows = cursor.fetchall()
    conn.close()

    by_province: dict[str, dict[str, int]] = {}
    for province, house_type, total in rows:
        by_province.setdefault(province, {})[normalize_house_type(house_type)] = total

    provinces = []
    for province, types in sorted(by_province.items()):
        provinces.append(
            {
                "province": province,
                "total": sum(types.values()),
                "types": {t: n for t, n in types.items()},
            }
        )
    provinces.sort(key=lambda x: x["total"], reverse=True)
    return provinces


def get_province_counts():
    """Recuento por provincia (mismo rango sano que el resto del dashboard)."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(f"""
        SELECT province, COUNT(*) AS total
        FROM properties
        WHERE {_base_where()}
        GROUP BY province
        ORDER BY total DESC
    """)
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_correlation():
    """Matriz de correlación entre variables numéricas (Pearson)."""
    import numpy as np

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(f"""
        SELECT price, log_price, price_per_m2, m2_real, m2_useful, room_num,
               bath_num, number_of_companies_prov, population_prov
        FROM properties
        WHERE {_base_where()}
          AND m2_useful IS NOT NULL
          AND room_num IS NOT NULL
          AND bath_num IS NOT NULL
    """)
    rows = cursor.fetchall()
    conn.close()

    if not rows:
        return {"features": [], "matrix": []}

    data = np.array(rows, dtype=float)
    if data.shape[0] < 50:
        return {"features": [], "matrix": []}

    # Guardar frente a columnas constantes/estables (corr => NaN)
    with np.errstate(all="ignore"):
        corr = np.corrcoef(data, rowvar=False)
        corr = np.nan_to_num(corr, nan=0.0)

    features = [
        "Precio",
        "Log precio",
        "€/m²",
        "m² reales",
        "m² útiles",
        "Habitaciones",
        "Baños",
        "Empresas (prov.)",
        "Población (prov.)",
    ]
    return {
        "features": features,
        "matrix": [[round(v, 3) for v in row] for row in corr],
    }