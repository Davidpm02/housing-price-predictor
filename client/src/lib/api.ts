import type { CCAACount, ProvinceCount } from "./geo";

export interface PropertyListItem {
  house_id: number;
  city: string;
  province: string;
  price: number;
  m2_real: number;
  room_num: number | null;
  house_type: string;
  full_location: string;
}

export interface PropertiesResponse {
  items: PropertyListItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface PropertyFilters {
  min_price: string;
  max_price: string;
  min_m2: string;
  min_rooms: string;
  min_baths: string;
  house_types: string[];
  conditions: string[];
  amenities: string[];
}

export const EMPTY_FILTERS: PropertyFilters = {
  min_price: "",
  max_price: "",
  min_m2: "",
  min_rooms: "",
  min_baths: "",
  house_types: [],
  conditions: [],
  amenities: [],
};

export function hasFilters(f: PropertyFilters): boolean {
  return (
    f.min_price !== "" ||
    f.max_price !== "" ||
    f.min_m2 !== "" ||
    f.min_rooms !== "" ||
    f.min_baths !== "" ||
    f.house_types.length > 0 ||
    f.conditions.length > 0 ||
    f.amenities.length > 0
  );
}

export interface PropertyDetail {
  house_id: number;
  ad_description: string | null;
  ad_last_update: string | null;
  price: number;
  price_per_m2: number | null;
  m2_real: number;
  m2_useful: number | null;
  room_num: number | null;
  bath_num: number | null;
  house_type: string;
  condition: string | null;
  floor: string | null;
  city: string;
  district: string | null;
  neighborhood: string | null;
  province: string;
  ccaa: string;
  zone: string | null;
  full_location: string;
  garage: string | null;
  terrace: number | null;
  balcony: number | null;
  lift: number | null;
  built_in_wardrobe: number | null;
  chimney: number | null;
  garden: number | null;
  storage_room: number | null;
  swimming_pool: number | null;
  air_conditioner: number | null;
  reduced_mobility: number | null;
  energetic_certif: string | null;
}

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Error ${res.status} al obtener ${url}`);
  }
  return res.json() as Promise<T>;
}

export function fetchProvinceCounts(): Promise<ProvinceCount[]> {
  return getJSON<ProvinceCount[]>("/api/properties/count/province");
}

export function fetchCCAACounts(): Promise<CCAACount[]> {
  return getJSON<CCAACount[]>("/api/properties/count/ccaa");
}

export async function fetchProperties(
  province: string,
  limit: number,
  offset: number,
  sort: string,
  filters: PropertyFilters = EMPTY_FILTERS
): Promise<PropertiesResponse> {
  const params = new URLSearchParams({
    province,
    limit: String(limit),
    offset: String(offset),
  });
  if (filters.min_price !== "") params.set("min_price", filters.min_price);
  if (filters.max_price !== "") params.set("max_price", filters.max_price);
  if (filters.min_m2 !== "") params.set("min_m2", filters.min_m2);
  if (filters.min_rooms !== "") params.set("min_rooms", filters.min_rooms);
  if (filters.min_baths !== "") params.set("min_baths", filters.min_baths);
  if (filters.house_types.length > 0)
    params.set("house_types", filters.house_types.join(","));
  if (filters.conditions.length > 0)
    params.set("conditions", filters.conditions.join(","));
  if (filters.amenities.length > 0)
    params.set("amenities", filters.amenities.join(","));

  return getJSON<PropertiesResponse>(`/api/properties/?${params.toString()}`);
}

export async function fetchPropertyDetail(
  houseId: number
): Promise<PropertyDetail> {
  return getJSON<PropertyDetail>(`/api/properties/${houseId}`);
}

export interface PredictionInput {
  m2_real: number;
  room_num: number;
  bath_num: number;
  province: string;
  house_type: string;
  condition: string;
  house_floors?: number;
  floor_number?: number;
  garage: number;
  lift: number;
  terrace: number;
  air_conditioner: number;
  balcony: number;
  built_in_wardrobe: number;
  chimney: number;
  garden: number;
  storage_room: number;
  swimming_pool: number;
}

export async function fetchPrediction(
  input: PredictionInput
): Promise<{ prediction: number; error?: string }> {
  const res = await fetch("/api/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error ?? "No se pudo calcular la estimación");
  }
  return data;
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}