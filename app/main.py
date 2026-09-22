"""
Contiene el código encargado del arranque de la app.
Sirve la API y el frontend estático construido desde client/.
"""

from pathlib import Path
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.api.routes.predict import router as predict_router
from app.api.routes.properties import router as properties_router
from app.api.routes.stats import router as stats_router

app = FastAPI(title="HomeValue API")

# CORS — necesario para el dev server de Vite en :5173
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict_router, prefix="/api")
app.include_router(properties_router, prefix="/api/properties")
app.include_router(stats_router)

STATIC_DIR = Path(__file__).resolve().parent / "static"
INDEX_HTML = STATIC_DIR / "index.html"


@app.get("/api/health")
def health():
    return {"status": "ok"}


class SPAFilterMiddleware(BaseHTTPMiddleware):
    """Si la petición es GET y la respuesta es 404, sirve index.html (SPA routing)."""

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        if (
            request.method == "GET"
            and response.status_code == 404
            and INDEX_HTML.is_file()
            and not request.url.path.startswith("/api")
            and not request.url.path.startswith("/assets")
        ):
            return FileResponse(INDEX_HTML)
        return response


if STATIC_DIR.is_dir() and INDEX_HTML.is_file():
    app.add_middleware(SPAFilterMiddleware)
    app.mount(
        "/assets",
        StaticFiles(directory=str(STATIC_DIR / "assets")),
        name="static-assets",
    )

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        """Catch-all: sirve index.html para cualquier ruta no-API (SPA routing)."""
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="Not found")
        file_path = STATIC_DIR / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(INDEX_HTML)
