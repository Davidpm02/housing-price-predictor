"""
Contiene la lógica dedicada al feature engineering.
 - Creación de nuevas features
 - Transformaciones matemáticas
"""

from app.config.features_config import FEATURES_ORDER


def build_feature_vector(df):
    return df[FEATURES_ORDER]