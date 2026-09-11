import logging
from app.config.settings import get_settings


def setup_logger():
    settings = get_settings()

    logging.basicConfig(
        level=settings.LOG_LEVEL,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )


def get_logger(name: str):
    return logging.getLogger(name)