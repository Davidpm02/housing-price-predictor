"""
Este fichero define la capa HTTP de la API para la predicción de precios de viviendas.
No contiene lógica de negocio ni de procesamiento de datos, solamente:
 - Recibe requests HTTP.
 - Llama a la pipeline de procesamiento y al modelo para generar predicciones.
 - Devuelve response.
"""

from fastapi import APIRouter
from app.schemas.prediction import PredictionInput

from app.processing.preprocess import preprocess_input
from app.processing.feature_engineering import create_features
from app.processing.encoding import encode_categorical
from app.processing.features import build_feature_vector

from app.models.model_loader import model_loader

from app.core.logger import get_logger

logger = get_logger(__name__)

router = APIRouter()


@router.post("/predict")
def predict(data: PredictionInput):
    try:
        # 1. preprocess
        logger.info("Starting preprocessing...")
        df = preprocess_input(data.dict())

        # 2. feature engineering
        logger.info("Starting feature engineering...")
        df = create_features(df)

        # 3. encoding
        logger.info("Starting encoding...")
        df = encode_categorical(df)

        # 4. ordenar features
        logger.info("Starting feature vector construction...")
        df = build_feature_vector(df)

        # 5. predicción
        logger.info("Starting prediction...")
        prediction = model_loader.predict(df)

        return {
            "prediction": float(prediction[0])
        }

    except Exception as e:
        logger.exception("Prediction pipeline failed")
        return {
            "error": str(e)
        }