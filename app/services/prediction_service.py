import pandas as pd

from app.processing.preprocess import preprocess_input
from app.processing.feature_engineering import apply_feature_engineering
from app.processing.encoding import encode_categorical
from app.processing.features import build_feature_vector
from app.core.logger import get_logger

logger = get_logger(__name__)


def predict(data: dict, model) -> float:
    try:
        logger.info("Starting prediction pipeline")

        # 1. dict → DataFrame
        df = pd.DataFrame([data])

        # 2. preprocessing (tipos, nulls)
        df = preprocess_input(df)

        # 3. feature engineering
        df = apply_feature_engineering(df)

        # 4. encoding (dummies, etc.)
        df = encode_categorical(df)

        # 5. ordenar features
        X = build_feature_vector(df)

        logger.info(f"Feature vector shape: {X.shape}")

        # 6. predicción
        prediction = model.predict(X)[0]

        logger.info(f"Prediction: {prediction}")

        return float(prediction)

    except Exception as e:
        logger.exception("Prediction pipeline failed")
        raise e