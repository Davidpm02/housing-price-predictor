export interface SummaryStats {
  total: number;
  avg_price: number;
  avg_price_per_m2: number;
  avg_m2: number;
  avg_rooms: number;
  avg_baths: number;
  total_provinces: number;
  total_ccaas: number;
  total_all: number;
}

export interface HouseTypeStats {
  house_type: string;
  total: number;
  avg_price: number;
  avg_price_per_m2: number;
  avg_m2: number;
}

export interface ProvinceStats {
  province: string;
  total: number;
  avg_price: number;
  avg_price_per_m2: number;
  avg_m2: number;
}

export interface PriceBucket {
  min: number;
  max: number;
  label: string;
  count: number;
}

export interface ScatterPoint {
  price: number;
  m2_real: number;
  room_num: number | null;
  bath_num: number | null;
  price_per_m2: number;
  house_type: string;
}

export interface AmenityStat {
  key: string;
  label: string;
  count: number;
  pct: number;
}

export interface AmenityResponse {
  total: number;
  items: AmenityStat[];
}

export interface ConditionStat {
  condition: string;
  total: number;
  label: string;
}

export interface M2Bucket {
  bucket: string;
  count: number;
  avg_price: number;
  avg_price_per_m2: number;
}

export interface Correlation {
  features: string[];
  matrix: number[][];
}

export interface BoxPlotStat {
  house_type: string;
  total: number;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  lower_fence: number;
  upper_fence: number;
  outliers: number;
}

export interface ProvinceTypeRow {
  province: string;
  total: number;
  types: Record<string, number>;
}

export interface ProvinceCountRow {
  province: string;
  total: number;
}

export async function fetchSummary(): Promise<SummaryStats> { return (await fetch("/api/stats/summary")).json(); }
export async function fetchHouseTypes(): Promise<HouseTypeStats[]> { return (await fetch("/api/stats/house-types")).json(); }
export async function fetchProvinces(): Promise<ProvinceStats[]> { return (await fetch("/api/stats/provinces")).json(); }
export async function fetchPriceDistribution(): Promise<PriceBucket[]> { return (await fetch("/api/stats/price-distribution")).json(); }
export async function fetchScatter(n = 3000): Promise<ScatterPoint[]> { return (await fetch(`/api/stats/scatter?n=${n}`)).json(); }
export async function fetchAmenities(): Promise<AmenityResponse> { return (await fetch("/api/stats/amenities")).json(); }
export async function fetchConditions(): Promise<ConditionStat[]> { return (await fetch("/api/stats/conditions")).json(); }
export async function fetchM2Buckets(): Promise<M2Bucket[]> { return (await fetch("/api/stats/m2-buckets")).json(); }
export async function fetchCorrelation(): Promise<Correlation> { return (await fetch("/api/stats/correlation")).json(); }
export async function fetchBoxplot(): Promise<BoxPlotStat[]> { return (await fetch("/api/stats/boxplot")).json(); }
export async function fetchProvinceType(): Promise<ProvinceTypeRow[]> { return (await fetch("/api/stats/province-type")).json(); }
export async function fetchProvinceCounts(): Promise<ProvinceCountRow[]> { return (await fetch("/api/stats/province-counts")).json(); }

export function formatEUR(value: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("es-ES").format(value);
}

const HOUSE_TYPE_COLORS: Record<string, string> = {
  Piso: "#2563eb",
  "Casa o chalet independiente": "#06b6d4",
  "Chalet adosado": "#8b5cf6",
  "Chalet pareado": "#10b981",
  "Casa de pueblo": "#f59e0b",
  "Casa o chalet": "#6366f1",
  "Finca rústica": "#84cc16",
  "Casa rural": "#14b8a6",
  "Dúplex": "#f43f5e",
  "Ático": "#ec4899",
  Estudio: "#64748b",
  Otros: "#94a3b8",
};

export function houseTypeColor(type: string): string {
  return HOUSE_TYPE_COLORS[type] ?? "#94a3b8";
}

export function colorScale(value: number): string {
  const t = Math.max(-1, Math.min(1, value));
  if (t >= 0) {
    const g = 130 + (255 - 130) * t;
    const b = 235 - (235 - 40) * t;
    const r = 30 + (16 - 30) * t;
    return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
  }
  const v = -t;
  const r = 239 + (255 - 239) * v;
  const g = 68 + (255 - 68) * v;
  const b = 68 + (255 - 68) * v;
  return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
}