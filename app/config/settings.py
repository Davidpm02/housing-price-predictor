from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    APP_NAME: str = "housing-price-predictor-platform"

    # paths
    MODEL_PATH: str = "models/random_forest_model.joblib"

    # logging
    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"


@lru_cache
def get_settings():
    return Settings()