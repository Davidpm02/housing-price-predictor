#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Instala dependencias y arranca la app completa (API + frontend construido)
# servida por uvicorn en :8000.
# ---------------------------------------------------------------------------
set -e
cd "$(dirname "$0")"

PYTHON_BIN="${PYTHON_BIN:-python3}"

echo "📦 Comprobando dependencias de Python..."
if ! "$PYTHON_BIN" -c "import fastapi, uvicorn, pandas, sklearn, joblib" 2>/dev/null; then
    echo "   Instalando requirements.txt..."
    "$PYTHON_BIN" -m pip install -r requirements.txt
fi

echo "📦 Comprobando frontend (cliente)..."
if [ ! -d client/node_modules ]; then
    echo "   Instalando dependencias de Node..."
    (cd client && npm install)
fi

echo "🔨 Construyendo frontend..."
(cd client && npm run build)

echo "🗄️ Comprobando base de datos..."
if [ -f "data/spanish_housing_clean.csv" ]; then
    DB_FILE="data/properties.db"
    NEED_SEED=0
    if [ ! -f "$DB_FILE" ]; then
        NEED_SEED=1
    else
        # Verifica si la tabla existe y tiene datos; si no, requiere seed
        if ! "$PYTHON_BIN" -c "import sqlite3, sys; conn=sqlite3.connect('$DB_FILE'); cur=conn.cursor(); cur.execute(\"SELECT count(*) FROM sqlite_master WHERE type='table' AND name='properties'\"); has_table=cur.fetchone()[0]; sys.exit(0 if has_table else 1)" 2>/dev/null; then
            NEED_SEED=1
        else
            COUNT=$("$PYTHON_BIN" -c "import sqlite3; conn=sqlite3.connect('$DB_FILE'); cur=conn.cursor(); cur.execute('SELECT COUNT(*) FROM properties'); print(cur.fetchone()[0])" 2>/dev/null || echo "0")
            if [ "$COUNT" = "0" ] || [ -z "$COUNT" ]; then
                NEED_SEED=1
            fi
        fi
    fi
    if [ "$NEED_SEED" -eq 1 ]; then
        echo "   Poblando base de datos desde data/spanish_housing_clean.csv..."
        "$PYTHON_BIN" -m app.db.seed || echo "   ⚠️  Error al poblar la base de datos. Verifica el dataset."
    else
        echo "   Base de datos ya poblada — omitiendo seed."
    fi
else
    echo "   ⚠️  Dataset no encontrado en data/spanish_housing_clean.csv — omitiendo seed."
    echo "      Coloca el CSV en data/ y vuelve a ejecutar ./run.sh para poblar la BD."
fi

echo "🚀 Arrancando servidor en http://localhost:8000"
exec "$PYTHON_BIN" -m uvicorn app.main:app --host 0.0.0.0 --port 8000
