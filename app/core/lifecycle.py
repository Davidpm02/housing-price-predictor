from fastapi import FastAPI
from app.models.model_loader import load_model
from app.core.logger import get_logger

logger = get_logger(__name__)


def register_lifecycle(app: FastAPI):

    @app.on_event("startup")
    def startup():
        logger.info("Loading ML model...")
        model = load_model()
        app.state.model = model
        logger.info("Model loaded successfully")

    @app.on_event("shutdown")
    def shutdown():
        logger.info("Shutting down application...")