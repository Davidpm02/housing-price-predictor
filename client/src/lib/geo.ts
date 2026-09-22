// Normalización de nombres entre el GeoJSON de provincias, la base de datos
// y el modelo de predicción.

export interface ProvinceFeature {
  type: "Feature";
  properties: {
    Codigo: string;
    Texto: string;
    Texto_Alt: string;
    Cod_CCAA: string;
    CCAA: string;
  };
  geometry: any;
}

export interface GeoCollection {
  type: "FeatureCollection";
  name: string;
  features: ProvinceFeature[];
}

/** Nombres de provincia propios del dataset final (para counts por provincia). */
export const DB_PROVINCES = new Set<string>([
  "A Coruña",
  "Albacete",
  "Alicante",
  "Balears (Illes)",
  "Barcelona",
  "Ciudad Real",
  "Cádiz",
  "Girona",
  "Guipúzcoa",
  "Huelva",
  "Madrid",
  "Santa Cruz de Tenerife",
  "Segovia",
  "Sevilla",
  "Soria",
  "Tarragona",
  "Valladolid",
  "València",
  "Vizcaya",
  "Zamora",
  "Álava",
]);

/** Provincias reconocidas por el modelo de ML (features del modelo). */
export const MODEL_PROVINCES = [
  "A Coruña",
  "Albacete",
  "Alicante",
  "Balears (Illes)",
  "Barcelona",
  "Ciudad Real",
  "Cádiz",
  "Girona",
  "Guipúzcoa",
  "Huelva",
  "Madrid",
  "Santa Cruz de Tenerife",
  "Segovia",
  "Sevilla",
  "Soria",
  "Tarragona",
  "Valladolid",
  "València",
  "Vizcaya",
  "Zamora",
  "Álava",
];

/** Normaliza un nombre de provincia del GeoJSON al nombre usado en BD/modelo. */
const PROVINCE_ALIASES: Record<string, string> = {
  "A Coruña": "A Coruña",
  "La Coruña": "A Coruña",
  Coruña: "A Coruña",
  "Islas Baleares": "Balears (Illes)",
  Baleares: "Balears (Illes)",
  Gerona: "Girona",
  "Santa Cruz de Tenerife": "Santa Cruz de Tenerife",
  "Santa Cruz De Tenerife": "Santa Cruz de Tenerife",
  Valencia: "València",
  "València / Valencia": "València",
  Orense: "Ourense",
};

export function normalizeProvinceName(raw: string): string {
  const trimmed = raw.trim();
  if (DB_PROVINCES.has(trimmed)) return trimmed;
  if (PROVINCE_ALIASES[trimmed]) return PROVINCE_ALIASES[trimmed];
  return trimmed;
}

/** Normaliza un nombre de CCAA del GeoJSON al nombre usado en la BD. */
const CCAA_ALIASES: Record<string, string> = {
  "Castilla - La Mancha": "Castilla-La Mancha",
  "Castilla-La Mancha": "Castilla-La Mancha",
  "Comunidad de Madrid": "Comunidad de Madrid",
  Madrid: "Comunidad de Madrid",
  "Región de Murcia": "Región de Murcia",
  Murcia: "Región de Murcia",
  "Comunidad Foral de Navarra": "Comunidad Foral de Navarra",
  Navarra: "Comunidad Foral de Navarra",
  "País Vasco": "País Vasco",
  "Asturias, Principado de": "Asturias, Principado de",
  Asturias: "Asturias, Principado de",
  Cantabria: "Cantabria",
  "Illes Balears": "Illes Balears",
  Baleares: "Illes Balears",
  "Islas Baleares": "Illes Balears",
  "Rioja, La": "La Rioja",
  "La Rioja": "La Rioja",
  Aragón: "Aragón",
  "Castilla y León": "Castilla y León",
  Cataluña: "Cataluña",
  "Comunitat Valenciana": "Comunitat Valenciana",
  Extremadura: "Extremadura",
  Galicia: "Galicia",
  Andalucía: "Andalucía",
  Canarias: "Canarias",
  Ceuta: "Ceuta",
  Melilla: "Melilla",
};

export function normalizeCCAAName(raw: string): string {
  return CCAA_ALIASES[raw.trim()] ?? raw.trim();
}

export interface ProvinceCount {
  province: string;
  total: number;
}

export interface CCAACount {
  ccaa: string;
  total: number;
}

export const HOUSE_TYPES = [
  "Piso",
  "Casa o chalet",
  "Casa o chalet independiente",
  "Ático",
  "Dúplex",
  "Estudio",
  "Chalet adosado",
  "Chalet pareado",
  "Casa de pueblo",
  "Casa rural",
  "Finca rústica",
  "Otros",
];

export const CONDITIONS = [
  { value: "segunda mano/buen estado", label: "Segunda mano · buen estado" },
  { value: "promoción de obra nueva", label: "Obra nueva" },
  { value: "segunda mano/para reformar", label: "Para reformar" },
];

/** Devuelve una escala de color para un conteo (más viviendas => más intenso). */
export function densityColor(count: number): string {
  if (count <= 0) return "#e8ebf0";
  if (count < 500) return "#dbeafe";
  if (count < 1000) return "#93c5fd";
  if (count < 2000) return "#60a5fa";
  if (count < 4000) return "#3b82f6";
  if (count < 8000) return "#2563eb";
  if (count < 15000) return "#1d4ed8";
  return "#1e3a8a";
}