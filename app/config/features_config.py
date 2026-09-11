"""
Contiene la configuración central de las features de la aplicación:
 - Lista de features finales
 - Lista de features relacionadas con el tipo de vivienda
 - Lista de features relacionadas con la provincia
 - Lista de features relacionadas con la condición de la vivienda
 - Features categóricas
 - Features numéricas
 - Target
"""

FEATURES_ORDER = [
    'air_conditioner', 'balcony', 'bath_num', 'built_in_wardrobe',
    'chimney', 'garage', 'garden', 'lift', 'm2_real', 'room_num',
    'storage_room', 'swimming_pool', 'terrace', 'population_prov',
    'house_floors', 'floor_number',
    'condition_promoción de obra nueva', 'condition_segunda mano/buen estado',
    'condition_segunda mano/para reformar', 'condition_unknown',
    'province_A Coruña', 'province_Albacete', 'province_Alicante',
    'province_Balears (Illes)', 'province_Barcelona',
    'province_Ciudad Real', 'province_Cádiz', 'province_Girona',
    'province_Guipúzcoa', 'province_Huelva', 'province_Madrid',
    'province_Santa Cruz de Tenerife', 'province_Segovia',
    'province_Sevilla', 'province_Soria', 'province_Tarragona',
    'province_Valladolid', 'province_València', 'province_Vizcaya',
    'province_Zamora', 'province_Álava', 'house_type_Casa de pueblo',
    'house_type_Casa o chalet', 'house_type_Casa o chalet independiente',
    'house_type_Casa rural', 'house_type_Chalet adosado',
    'house_type_Chalet pareado', 'house_type_Dúplex', 'house_type_Estudio',
    'house_type_Finca rústica', 'house_type_Otros', 'house_type_Piso',
    'house_type_Ático']

HOUSE_TYPE_FEATURES = [
    "Casa de pueblo",
    "Casa o chalet",
    "Casa o chalet independiente",
    "Casa rural",
    "Chalet adosado",
    "Chalet pareado",
    "Dúplex",
    "Estudio",
    "Finca rústica",
    "Otros",
    "Piso",
    "Ático"
]

PROVINCE_FEATURES = [
    'province_A Coruña', 'province_Albacete', 'province_Alicante',
    'province_Balears (Illes)', 'province_Barcelona',
    'province_Ciudad Real', 'province_Cádiz', 'province_Girona',
    'province_Guipúzcoa', 'province_Huelva', 'province_Madrid',
    'province_Santa Cruz de Tenerife', 'province_Segovia',
    'province_Sevilla', 'province_Soria', 'province_Tarragona',
    'province_Valladolid', 'province_València', 'province_Vizcaya',
    'province_Zamora', 'province_Álava',
]

CONDITION_FEATURES = [
    "promoción de obra nueva",
    "segunda mano/buen estado",
    "segunda mano/para reformar",
    "unknown"
]

NUMERICAL_FEATURES = [
    "m2_real",
    "room_num",
    "bath_room",
    "floor_number",
    "house_floors"
]

CATEGORICAL_FEATURES = [
    "city",
    "province"
]

BINARY_FEATURES = [
    "garage",
    "lift",
    "terrace",
    "air_conditioner",
    "balcony",
    "built_in_wardrobe",
    "chimney",
    "garden",
    "storage_room",
    "swimming_pool"
]

REQUIRED_FEATURES = [
    "m2_real",
    "room_num",
    "bath_room",
    "city",
    "province"
]