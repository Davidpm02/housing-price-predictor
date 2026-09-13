"""
Contiene la lógica dedicada a la carga del modelo de ML:
 - Carga del modelo desde disco
 - Mantener una única instancia (singleton)
 - Validar compatibilidad con FEATURES_ORDER
 - Exponer método de predicción limpio
"""

import joblib
import numpy as np
from pathlib import Path

from app.config.features_config import FEATURES_ORDER

from app.core.logger import get_logger

logger = get_logger(__name__)


MODEL_PATH = Path("models/random_forest_model.joblib")


class ModelLoader:
    def __init__(self):
        self.model = None

    def load(self):
        if self.model is None:
            if not MODEL_PATH.exists():
                raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")

            self.model = joblib.load(MODEL_PATH)
            logger.info(f"Model loaded from {MODEL_PATH}")
            self._validate_model()

        return self.model

    def _validate_model(self):
        """
        Validaciones críticas para evitar errores silenciosos
        """
        if not hasattr(self.model, "predict"):
            raise ValueError("Loaded object is not a valid model (missing predict method)")

        # Validar número de features
        if hasattr(self.model, "n_features_in_"):
            if self.model.n_features_in_ != len(FEATURES_ORDER):
                raise ValueError(
                    f"Feature mismatch: model expects {self.model.n_features_in_}, "
                    f"but FEATURES_ORDER has {len(FEATURES_ORDER)}"
                )

        # Validar nombres de features (si existen)
        if hasattr(self.model, "feature_names_in_"):
            model_features = list(self.model.feature_names_in_)
            if model_features != FEATURES_ORDER:
                raise ValueError(
                    "Feature names mismatch between model and FEATURES_ORDER"
                )

    def predict(self, df):
        model = self.load()

        # Validación de shape en runtime
        logger.info(f"Input shape: {df.shape}")
        if df.shape[1] != len(FEATURES_ORDER):
            raise ValueError(
                f"Invalid input shape: expected {len(FEATURES_ORDER)} features, got {df.shape[1]}"
            )

        preds = model.predict(df)

        if hasattr(model, "predict"):
            return preds

        return preds


# instancia global (singleton)
model_loader = ModelLoader()