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

echo "🚀 Arrancando servidor en http://localhost:8000"
exec "$PYTHON_BIN" -m uvicorn app.main:app --host 0.0.0.0 --port 8000