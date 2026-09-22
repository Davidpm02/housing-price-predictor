import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import {
  densityColor,
  normalizeCCAAName,
  normalizeProvinceName,
  type GeoCollection,
  type ProvinceFeature,
  type ProvinceCount,
} from "../lib/geo";
import { useUI } from "../lib/ui";

interface Props {
  drilledCCAA: string | null;
  provinceCounts: ProvinceCount[];
  countsByCCAA: Map<string, number>;
  selectedProvince: string | null;
  onSelectProvince: (province: string) => void;
  onDrill: (ccaa: string) => void;
}

const GEO_URL = "/assets/geo/provincias_spain.geojson";
const GEO_PADDING: L.FitBoundsOptions = { padding: [28, 28] };

// By default se usan tiles de OpenStreetMap (sin API key).
// Si se define VITE_CARTO_API_KEY en .env del cliente, se vuelve a usar el
// estilo Voyager de CARTO con esa key.
const CARTO_KEY = import.meta.env.VITE_CARTO_API_KEY as string | undefined;

const TILE_URL = CARTO_KEY
  ? "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=" +
    CARTO_KEY
  : "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

const TILE_ATTRIBUTION = CARTO_KEY
  ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
  : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const TILE_OPTIONS: L.TileLayerOptions = CARTO_KEY
  ? { attribution: TILE_ATTRIBUTION, maxZoom: 19, subdomains: "abcd" }
  : { attribution: TILE_ATTRIBUTION, maxZoom: 19 };

interface GeoDataBundle {
  geo: GeoCollection;
  byCCAA: Map<string, ProvinceFeature[]>;
  countByProvince: Map<string, number>;
  countsByCCAA: Map<string, number>;
}

function aggregateFeatures(geo: GeoCollection): Map<string, ProvinceFeature[]> {
  const byCCAA = new Map<string, ProvinceFeature[]>();
  for (const f of geo.features) {
    const key = normalizeCCAAName(f.properties.CCAA);
    if (!byCCAA.has(key)) byCCAA.set(key, []);
    byCCAA.get(key)!.push(f);
  }
  return byCCAA;
}

function buildCountMap(provinceCounts: ProvinceCount[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const c of provinceCounts) {
    const key = normalizeProvinceName(c.province).toLowerCase();
    if (!map.has(key)) map.set(key, c.total);
  }
  return map;
}

function countForFeature(
  feature: ProvinceFeature,
  countByProvince: Map<string, number>
): number {
  const candidates = [feature.properties.Texto, feature.properties.Texto_Alt].filter(
    Boolean
  ) as string[];
  for (const name of candidates) {
    const hit = countByProvince.get(normalizeProvinceName(name).toLowerCase());
    if (hit !== undefined) return hit;
  }
  return 0;
}

function featureCanonicalNames(feature: ProvinceFeature): string[] {
  return [feature.properties.Texto, feature.properties.Texto_Alt]
    .filter(Boolean)
    .map((n) => normalizeProvinceName(n));
}

function boundsOf(features: ProvinceFeature[]): L.LatLngBounds {
  const b = L.latLngBounds([]);
  for (const f of features) {
    const fb = L.geoJSON(f).getBounds();
    if (fb.isValid()) b.extend(fb);
  }
  return b;
}

function centroidOf(feature: ProvinceFeature): L.LatLng {
  return L.geoJSON(feature).getBounds().getCenter();
}

function countBadgeIcon(count: number, unit: string): L.DivIcon {
  return L.divIcon({
    className: "province-count-marker",
    html: `<div class="province-count-badge" style="background:${densityColor(count)};"><b>${count.toLocaleString(
      "es-ES"
    )}</b><span class="province-count-unit">${unit}</span></div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

function useGeoData(): GeoCollection | null {
  const [geo, setGeo] = useState<GeoCollection | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch(GEO_URL)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setGeo(d);
      })
      .catch(() => {
        if (!cancelled) setGeo(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return geo;
}

export default function SpainMap({
  drilledCCAA,
  provinceCounts,
  countsByCCAA,
  selectedProvince,
  onSelectProvince,
  onDrill,
}: Props) {
  const { t, formatNumber, provinceLabel } = useUI();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const overlayRef = useRef<L.LayerGroup | null>(null);
  const geo = useGeoData();

  const bundle: GeoDataBundle | null = useMemo(() => {
    if (!geo) return null;
    return {
      geo,
      byCCAA: aggregateFeatures(geo),
      countByProvince: buildCountMap(provinceCounts),
      countsByCCAA: new Map(countsByCCAA),
    };
  }, [geo, provinceCounts, countsByCCAA]);

  // Una única instancia de mapa, creada cuando load: los cambios de vista
  // rellenan el layer group sin destruir el mapa (evita el "parpadeo").
  useEffect(() => {
    if (!containerRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
      attributionControl: true,
      minZoom: 3,
    });
    map.setView([40.416775, -3.70379], 6);
    mapRef.current = map;
    L.tileLayer(TILE_URL, TILE_OPTIONS).addTo(map);
    overlayRef.current = L.layerGroup().addTo(map);

    return () => {
      overlayRef.current = null;
      mapRef.current = null;
      map.remove();
    };
  }, []);

  // Pinta las capas y mueve la cámara en función de la vista actual.
  useEffect(() => {
    const map = mapRef.current;
    const overlay = overlayRef.current;
    if (!map || !overlay || !bundle) return;

    overlay.clearLayers();
    const { geo, byCCAA, countByProvince } = bundle;

    const tooltip = (name: string, count: number, hint?: string) =>
      `<div class="map-tip"><b>${name}</b><span>${
        formatNumber(count) || "0"
      } ${t("map.units")}${hint ? " · " + hint : ""}</span></div>`;

    if (!drilledCCAA) {
      // ---- Vista raíz: España ----
      overlay.addLayer(boundsMarkerLayer(geo, countByProvince, tooltip));
      overlay.addLayer(
        ccaaOutlineLayer(byCCAA, bundle.countsByCCAA, tooltip, onDrill, t, formatNumber)
      );
    } else {
      // ---- Vista drill-down: provincias de la CCAA seleccionada ----
      const feats = byCCAA.get(drilledCCAA) ?? [];
      overlay.addLayer(
        provinceLayer(
          feats,
          countByProvince,
          tooltip,
          t,
          formatNumber,
          provinceLabel,
          onSelectProvince
        )
      );
    }

    // Mover la cámara suavemente sobre el destino correcto.
    const frame = requestAnimationFrame(() => {
      map.invalidateSize();
      const target = (() => {
        if (selectedProvince) {
          const feature = bundle.geo.features.find((f) =>
            featureCanonicalNames(f).includes(selectedProvince)
          );
          if (feature) {
            const b = L.geoJSON(feature).getBounds();
            return b.isValid() ? b : null;
          }
          return null;
        }
        if (drilledCCAA) {
          const b = boundsOf(byCCAA.get(drilledCCAA) ?? []);
          return b.isValid() ? b : null;
        }
        const b = boundsOf(bundle.geo.features);
        return b.isValid() ? b.pad(0.08) : null;
      })();
      if (target) map.flyToBounds(target, GEO_PADDING);
    });
    return () => cancelAnimationFrame(frame);
  }, [bundle, drilledCCAA, selectedProvince, onSelectProvince, onDrill]);

  return <div ref={containerRef} className="spain-map" />;
}

function boundsMarkerLayer(
  geo: GeoCollection,
  countByProvince: Map<string, number>,
  tooltip: (name: string, count: number, hint?: string) => string
): L.LayerGroup {
  const group = L.layerGroup();
  for (const f of geo.features) {
    const count = countForFeature(f, countByProvince);
    const fill = count > 0 ? densityColor(count) : "#f4f6fa";
    L.geoJSON(f, {
      style: {
        color: "#cbd5e1",
        weight: 0.7,
        fillColor: fill,
        fillOpacity: count > 0 ? 0.6 : 0.35,
      },
      interactive: false,
    }).addTo(group);
  }
  return group;
}

function ccaaOutlineLayer(
  byCCAA: Map<string, ProvinceFeature[]>,
  countsByCCAA: Map<string, number>,
  tooltip: (name: string, count: number, hint?: string) => string,
  onDrill: (ccaa: string) => void,
  t: (k: string, v?: Record<string, string | number>) => string,
  formatNumber: (n: number) => string
): L.LayerGroup {
  const group = L.layerGroup();
  [...byCCAA.entries()].forEach(([ccaa, feats]) => {
    const total = countsByCCAA.get(ccaa) ?? 0;
    L.geoJSON(feats, {
      style: {
        color: "#5b6b86",
        weight: 1.6,
        fillColor: "transparent",
        fillOpacity: 0,
        opacity: 0.9,
      },
    })
      .on("click", () => onDrill(ccaa))
      .bindTooltip(
        `<div class="map-tip ccaa-tip"><b>${ccaa}</b><span>${
          formatNumber(total) || t("map.noData")
        } ${t("map.units")} · ${t("map.clickExplore")}</span></div>`,
        { direction: "center", className: "leaflet-tip-ccaa" }
      )
      .addTo(group);
  });
  return group;
}

function provinceLayer(
  feats: ProvinceFeature[],
  countByProvince: Map<string, number>,
  tooltip: (name: string, count: number, hint?: string) => string,
  t: (k: string, v?: Record<string, string | number>) => string,
  formatNumber: (n: number) => string,
  provinceLabel: (n: string) => string,
  onSelectProvince: (province: string) => void
): L.LayerGroup {
  const group = L.layerGroup();
  for (const f of feats) {
    const count = countForFeature(f, countByProvince);
    const name = f.properties.Texto;
    const fill = count > 0 ? densityColor(count) : "#f4f6fa";
    if (count > 0) {
      L.marker(centroidOf(f), {
        icon: countBadgeIcon(count, t("map.units")),
        interactive: true,
      })
        .on("click", () => onSelectProvince(normalizeProvinceName(name)))
        .addTo(group);
    }
    L.geoJSON(f, {
      style: {
        color: "#64748b",
        weight: 1.2,
        fillColor: fill,
        fillOpacity: count > 0 ? 0.8 : 0.5,
      },
    })
      .on("click", () => {
        if (count > 0) onSelectProvince(normalizeProvinceName(name));
      })
      .bindTooltip(
        tooltip(
          provinceLabel(name),
          count,
          count > 0 ? t("map.clickSee") : undefined
        ),
        { direction: "top", opacity: 0.95 }
      )
      .addTo(group);
  }
  return group;
}