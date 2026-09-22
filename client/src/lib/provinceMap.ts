import type { ProvinceCount } from "./geo";

// Tabla de pertenencia: provincia (nombre del dataset) → CCAA (nombre del dataset)
export const PROVINCE_CCAA: Record<string, string> = {
  "A Coruña": "Galicia",
  "Álava": "País Vasco",
  "Albacete": "Castilla-La Mancha",
  "Alicante": "Comunitat Valenciana",
  "Balears (Illes)": "Illes Balears",
  "Barcelona": "Cataluña",
  "Cádiz": "Andalucía",
  "Ciudad Real": "Castilla-La Mancha",
  "Girona": "Cataluña",
  "Guipúzcoa": "País Vasco",
  "Huelva": "Andalucía",
  "Madrid": "Comunidad de Madrid",
  "Santa Cruz De Tenerife": "Canarias",
  "Segovia": "Castilla y León",
  "Sevilla": "Andalucía",
  "Soria": "Castilla y León",
  "Tarragona": "Cataluña",
  "Valladolid": "Castilla y León",
  "València": "Comunitat Valenciana",
  "Vizcaya": "País Vasco",
  "Zamora": "Castilla y León",
};

export function aggregateByCCAA(
  provinceCounts: ProvinceCount[]
): Map<string, number> {
  const map = new Map<string, number>();
  for (const c of provinceCounts) {
    const ccaa = PROVINCE_CCAA[c.province.trim()] ?? "Otras";
    map.set(ccaa, (map.get(ccaa) ?? 0) + c.total);
  }
  return map;
}
