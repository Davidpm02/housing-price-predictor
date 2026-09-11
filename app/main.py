"""
Contiene el código encargado del arranque de la app.
"""

from fastapi import FastAPI
from app.api.routes.predict import router as predict_router

app = FastAPI()

app.include_router(predict_router, prefix="/api")