import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

export type Lang = "en" | "es";
export type Theme = "light" | "dark";

const EN: Record<string, string> = {
  // Navegación
  "nav.valuate": "Valuation",
  "nav.explore": "Explore",
  "nav.dashboard": "📊 Dashboard Spanish Housing Dataset",
  "back.home": "← Back to home",

  // Hero index
  "hero.eyebrow": "🤖 Powered by Machine Learning",
  "hero.title.start": "Discover how much your",
  "hero.title.highlight": "home",
  "hero.title.end": "is worth",
  "hero.sub": "Model trained on {n} real homes in Spain. Enter your details and get a market estimate instantly.",
  "hero.point.speed": "⚡ Results in seconds",
  "hero.point.coverage": "🗺️ Coverage in {n} provinces",
  "hero.point.data": "🎯 Based on real market prices",

  // Sección mapa
  "map.eyebrow": "Explore the territory",
  "map.title": "Map of autonomous communities",
  "map.sub": "Click an autonomous community to zoom in and discover its provinces.",
  "map.drilled.sub": "{n} homes registered in this community. Select a province to see its properties.",
  "map.back": "← Back to Spain",
  "map.units": "homes",
  "map.clickSee": "click to see",
  "map.clickExplore": "click to explore",
  "map.noData": "No data",

  // Formulario de valoración
  "form.location": "📍 Location",
  "form.province": "Province",
  "form.selectProvince": "Select province",
  "form.features": "🏠 Features",
  "form.houseType": "Property type",
  "form.selectType": "Select type",
  "form.condition": "Condition",
  "form.selectCondition": "Select condition",
  "form.dimensions": "📐 Dimensions",
  "form.m2": "Useful m² *",
  "form.rooms": "Bedrooms *",
  "form.baths": "Bathrooms *",
  "form.extras": "✨ Extras",
  "form.estimate": "Estimate my home",
  "form.error.required": "Complete all required fields",
  "form.error.unknown": "Unknown error",
  "result.kicker": "Estimated value",
  "result.note": "Based on a Machine Learning model trained with {n} homes in {province}.",

  // Panel de propiedades
  "panel.homesIn": "Homes in {province}",
  "panel.properties": "{n} properties",
  "panel.close": "Close",
  "panel.loading": "Loading properties…",
  "panel.empty": "No properties match the filters.",
  "panel.viewDetail": "View details →",
  "panel.prev": "← Previous",
  "panel.next": "Next →",
  "panel.page": "Page {page} of {pages}",
  "panel.loadingDot": " · loading…",
  "panel.sort.price": "Price",
  "panel.sort.m2": "m²",
  "panel.loadingDetail": "Loading details…",

  // Filtros
  "filter.title": "Filters",
  "filter.clear": "Clear",
  "filter.price": "Price",
  "filter.min": "Min",
  "filter.max": "Max",
  "filter.noLimit": "No limit",
  "filter.limits": "Limits",
  "filter.minM2": "Min surface (m²)",
  "filter.minRooms": "Min bedrooms",
  "filter.minBaths": "Min bathrooms",
  "filter.houseType": "Property type",
  "filter.condition": "Condition",
  "filter.extras": "Extras",
  "filter.activeHint": "Applying {n} selections and limits to the listing.",

  // Modal de detalle
  "modal.detail": "Property details",
  "modal.description": "Description",
  "modal.features": "Features",
  "modal.extras": "Extras",
  "modal.location": "Location",
  "modal.municipality": "Municipality",
  "modal.district": "District",
  "modal.neighborhood": "Neighborhood",
  "modal.zone": "Zone",
  "modal.province": "Province",
  "modal.region": "Region",
  "modal.updated": "Listing last updated: {date}",
  "modal.pricePerM2": "Price per m²",
  "modal.m2useful": "Useful surface",
  "modal.rooms": "Bedrooms",
  "modal.baths": "Bathrooms",
  "modal.floor": "Floor",
  "modal.condition": "Condition",
  "modal.garage": "Garage",
  "modal.energy": "Energy cert.",

  // Dashboard
  "dash.eyebrow": "📊 Data analytics",
  "dash.title": "Dashboard Spanish Housing Dataset",
  "dash.sub": "Relationships between variables, price distribution, trends by surface and correlation map of the Spanish real estate market.",
  "kpi.homes": "Homes analyzed",
  "kpi.homesHint": "{n} total records",
  "kpi.avgPrice": "Average price",
  "kpi.avgSurface": "Average surface",
  "kpi.avgRooms": "Average bedrooms",
  "kpi.coverage": "Coverage",
  "dash.priceDist": "Price distribution",
  "dash.priceDistSub": "Homes per price range (25,000 € steps)",
  "dash.composition": "Composition by property type",
  "dash.compositionSub": "Share of homes by type",
  "dash.avgByType": "Average price by property type",
  "dash.avgByTypeSub": "Which type is worth more in the market?",
  "dash.provincePpm": "Average price per m² by province",
  "dash.provincePpmSub": "The 12 provinces with the highest price per square meter",
  "dash.provinceCounts": "Number of properties by province",
  "dash.provinceCountsSub": "Homes registered in each province (healthy range)",
  "dash.boxplot": "Price by property type (boxplot)",
  "dash.boxplotSub": "Median, quartiles and typical price range by type",
  "dash.provinceType": "Distribution by province and property type",
  "dash.provinceTypeSub": "Choose a type to compare its presence in each province",
  "dash.scatter": "Price vs surface relationship",
  "dash.scatterSub": "{n} sampled homes · color by type",
  "dash.extras": "Most frequent extras",
  "dash.extrasSub": "% of homes with each extra",
  "dash.trend": "Trend: €/m² by surface",
  "dash.trendSub": "Average price per m² according to home size",
  "dash.condition": "Home condition",
  "dash.conditionSub": "Distribution by declared condition",
  "dash.heatmap": "Heatmap · correlations",
  "dash.heatmapSub": "Pearson correlation between numerical variables. Blue indicates a direct relationship, teal an inverse one.",
  "dash.errorLoad": "Failed to load the statistics",
  "dash.surfaceAxis": "Surface (m²)",
  "dash.allTypes": "All types (stacked)",
  "dash.typeLabel": "Property type",
  "dash.price": "Price",
  "dash.pct": "share of homes",
  "dash.boxplotNote": "The box spans the interquartile range (Q1–Q3), the white line is the median and the whiskers the typical range (taken as 1.5 × IQR).",
  "dash.noData": "Not enough data",

  // boxplot
  "box.median": "Median",
  "box.q1": "Q1",
  "box.q3": "Q3",
  "box.range": "Range",
  "box.outliers": "outliers",
  "box.homes": "homes",

  // heatmap features
  "heat.Precio": "Price",
  "heat.Log precio": "Log price",
  "heat.€/m²": "€/m²",
  "heat.m² reales": "m² real",
  "heat.m² útiles": "m² useful",
  "heat.Habitaciones": "Bedrooms",
  "heat.Baños": "Bathrooms",
  "heat.Empresas (prov.)": "Businesses (prov.)",
  "heat.Población (prov.)": "Population (prov.)",

  // amenities
  "amenity.garage": "Garage",
  "amenity.lift": "Elevator",
  "amenity.terrace": "Terrace",
  "amenity.balcony": "Balcony",
  "amenity.air_conditioner": "A/C",
  "amenity.built_in_wardrobe": "Wardrobes",
  "amenity.chimney": "Fireplace",
  "amenity.garden": "Garden",
  "amenity.storage_room": "Storage room",
  "amenity.swimming_pool": "Pool",
  "amenity.reduced_mobility": "Reduced mobility",

  // condición
  "cond.second": "Second-hand · good condition",
  "cond.new": "New build",
  "cond.reform": "To renovate",

  // tipos de vivienda
  "type.Piso": "Apartment",
  "type.Casa o chalet": "House / townhouse",
  "type.Casa o chalet independiente": "Detached house",
  "type.Ático": "Penthouse",
  "type.Dúplex": "Duplex",
  "type.Estudio": "Studio",
  "type.Chalet adosado": "Terraced house",
  "type.Chalet pareado": "Semi-detached house",
  "type.Casa de pueblo": "Village house",
  "type.Casa rural": "Country house",
  "type.Finca rústica": "Country estate",
  "type.Otros": "Other",

  // provincias
  "prov.A Coruña": "A Coruña",
  "prov.Albacete": "Albacete",
  "prov.Alicante": "Alicante",
  "prov.Balears (Illes)": "Balearic Islands",
  "prov.Barcelona": "Barcelona",
  "prov.Ciudad Real": "Ciudad Real",
  "prov.Cádiz": "Cadiz",
  "prov.Girona": "Girona",
  "prov.Guipúzcoa": "Gipuzkoa",
  "prov.Huelva": "Huelva",
  "prov.Madrid": "Madrid",
  "prov.Santa Cruz de Tenerife": "Santa Cruz de Tenerife",
  "prov.Segovia": "Segovia",
  "prov.Sevilla": "Seville",
  "prov.Soria": "Soria",
  "prov.Tarragona": "Tarragona",
  "prov.Valladolid": "Valladolid",
  "prov.València": "Valencia",
  "prov.Vizcaya": "Biscay",
  "prov.Zamora": "Zamora",
  "prov.Álava": "Álava",

  // Footer
  "footer.index": "Educational project · Model trained with scikit-learn · Estimated prices without binding character",
  "footer.dashboard": "Educational project · Dashboard of the Spanish real estate dataset · Anonymous aggregated data",
};

const ES: Record<string, string> = {
  "nav.valuate": "Valoración",
  "nav.explore": "Explorar",
  "nav.dashboard": "📊 Dashboard Spanish Housing Dataset",
  "back.home": "← Volver al inicio",

  "hero.eyebrow": "🤖 Impulsado por Machine Learning",
  "hero.title.start": "Descubre cuánto vale tu",
  "hero.title.highlight": "vivienda",
  "hero.title.end": "",
  "hero.sub": "Modelo entrenado sobre {n} viviendas reales en España. Introduce los datos y obtén una estimación de mercado al instante.",
  "hero.point.speed": "⚡ Resultados en segundos",
  "hero.point.coverage": "🗺️ Cobertura en {n} provincias",
  "hero.point.data": "🎯 Basado en precios reales del mercado",

  "map.eyebrow": "Explora el territorio",
  "map.title": "Mapa de comunidades autónomas",
  "map.sub": "Haz clic en una comunidad autónoma para hacer zoom y descubrir sus provincias.",
  "map.drilled.sub": "{n} viviendas registradas en esta comunidad. Selecciona una provincia para ver sus propiedades.",
  "map.back": "← Volver a España",
  "map.units": "viviendas",
  "map.clickSee": "clic para ver",
  "map.clickExplore": "clic para explorar",
  "map.noData": "Sin datos",

  "form.location": "📍 Ubicación",
  "form.province": "Provincia",
  "form.selectProvince": "Selecciona provincia",
  "form.features": "🏠 Características",
  "form.houseType": "Tipo de vivienda",
  "form.selectType": "Selecciona tipo",
  "form.condition": "Estado",
  "form.selectCondition": "Selecciona estado",
  "form.dimensions": "📐 Dimensiones",
  "form.m2": "m² útiles *",
  "form.rooms": "Habitaciones *",
  "form.baths": "Baños *",
  "form.extras": "✨ Extras",
  "form.estimate": "Estimar mi vivienda",
  "form.error.required": "Completa todos los campos obligatorios",
  "form.error.unknown": "Error desconocido",
  "result.kicker": "Estimación de valor",
  "result.note": "Basada en un modelo de Machine Learning entrenado con {n} viviendas de {province}.",

  "panel.homesIn": "Viviendas en {province}",
  "panel.properties": "{n} propiedades",
  "panel.close": "Cerrar",
  "panel.loading": "Cargando propiedades…",
  "panel.empty": "No hay propiedades que coincidan con los filtros.",
  "panel.viewDetail": "Ver detalle →",
  "panel.prev": "← Anterior",
  "panel.next": "Siguiente →",
  "panel.page": "Página {page} de {pages}",
  "panel.loadingDot": " · cargando…",
  "panel.sort.price": "Precio",
  "panel.sort.m2": "m²",
  "panel.loadingDetail": "Cargando detalle…",

  "filter.title": "Filtros",
  "filter.clear": "Limpiar",
  "filter.price": "Precio",
  "filter.min": "Mín",
  "filter.max": "Máx",
  "filter.noLimit": "Sin límite",
  "filter.limits": "Límites",
  "filter.minM2": "Superficie mín. (m²)",
  "filter.minRooms": "Habitaciones mín.",
  "filter.minBaths": "Baños mín.",
  "filter.houseType": "Tipo de vivienda",
  "filter.condition": "Estado",
  "filter.extras": "Extras",
  "filter.activeHint": "Aplicando {n} selecciones y límites sobre el listado.",

  "modal.detail": "Detalle de la vivienda",
  "modal.description": "Descripción",
  "modal.features": "Características",
  "modal.extras": "Extras",
  "modal.location": "Localización",
  "modal.municipality": "Municipio",
  "modal.district": "Distrito",
  "modal.neighborhood": "Barrio",
  "modal.zone": "Zona",
  "modal.province": "Provincia",
  "modal.region": "Comunidad",
  "modal.updated": "Última actualización del anuncio: {date}",
  "modal.pricePerM2": "Precio por m²",
  "modal.m2useful": "Superficie útil",
  "modal.rooms": "Habitaciones",
  "modal.baths": "Baños",
  "modal.floor": "Planta",
  "modal.condition": "Estado",
  "modal.garage": "Garaje",
  "modal.energy": "Certif. energética",

  "dash.eyebrow": "📊 Analítica de datos",
  "dash.title": "Dashboard Spanish Housing Dataset",
  "dash.sub": "Relaciones entre variables, distribución de precios, tendencias por superficie y mapa de correlaciones del mercado inmobiliario español.",
  "kpi.homes": "Viviendas analizadas",
  "kpi.homesHint": "{n} registros en total",
  "kpi.avgPrice": "Precio medio",
  "kpi.avgSurface": "Superficie media",
  "kpi.avgRooms": "Habitaciones medias",
  "kpi.coverage": "Cobertura",
  "dash.priceDist": "Distribución de precios",
  "dash.priceDistSub": "Viviendas por tramo de precio (pasos de 25.000 €)",
  "dash.composition": "Composición por tipo de vivienda",
  "dash.compositionSub": "Reparto de las viviendas según su tipología",
  "dash.avgByType": "Precio medio según el tipo de vivienda",
  "dash.avgByTypeSub": "¿Qué tipología vale más en el mercado?",
  "dash.provincePpm": "Precio por m² medio por provincia",
  "dash.provincePpmSub": "Las 12 provincias con mayor precio por metro cuadrado",
  "dash.provinceCounts": "Número de propiedades por provincia",
  "dash.provinceCountsSub": "Viviendas registradas en cada provincia (rango sano)",
  "dash.boxplot": "Precio por tipo de vivienda (boxplot)",
  "dash.boxplotSub": "Mediana, cuartiles y rango típico de precios por tipología",
  "dash.provinceType": "Distribución por provincia y tipo de vivienda",
  "dash.provinceTypeSub": "Elige un tipo para comparar su presencia en cada provincia",
  "dash.scatter": "Relación precio vs superficie",
  "dash.scatterSub": "{n} viviendas muestreadas · color por tipología",
  "dash.extras": "Extras más frecuentes",
  "dash.extrasSub": "% de viviendas que disponen de cada extra",
  "dash.trend": "Tendencia: €/m² según superficie",
  "dash.trendSub": "Precio medio por m² en función del tamaño de la vivienda",
  "dash.condition": "Estado de la vivienda",
  "dash.conditionSub": "Distribución según el estado declarado",
  "dash.heatmap": "Mapa de calor · correlaciones",
  "dash.heatmapSub": "Correlación de Pearson entre variables numéricas. El azul indica relación directa, el teal la inversa.",
  "dash.errorLoad": "No se pudieron cargar las estadísticas",
  "dash.surfaceAxis": "Superficie (m²)",
  "dash.allTypes": "Todos los tipos (apilado)",
  "dash.typeLabel": "Tipo de vivienda",
  "dash.price": "Precio",
  "dash.pct": "% de viviendas",
  "dash.boxplotNote": "La caja representa el rango intercuartílico (Q1–Q3), la línea blanca la mediana y las colas el rango típico (tomado como 1,5 × IQR).",
  "dash.noData": "Sin datos suficientes",

  "box.median": "Mediana",
  "box.q1": "Q1",
  "box.q3": "Q3",
  "box.range": "Rango",
  "box.outliers": "atípicos",
  "box.homes": "viviendas",

  "heat.Precio": "Precio",
  "heat.Log precio": "Log precio",
  "heat.€/m²": "€/m²",
  "heat.m² reales": "m² reales",
  "heat.m² útiles": "m² útiles",
  "heat.Habitaciones": "Habitaciones",
  "heat.Baños": "Baños",
  "heat.Empresas (prov.)": "Empresas (prov.)",
  "heat.Población (prov.)": "Población (prov.)",

  "amenity.garage": "Garaje",
  "amenity.lift": "Ascensor",
  "amenity.terrace": "Terraza",
  "amenity.balcony": "Balcón",
  "amenity.air_conditioner": "A/C",
  "amenity.built_in_wardrobe": "Armarios",
  "amenity.chimney": "Chimenea",
  "amenity.garden": "Jardín",
  "amenity.storage_room": "Trastero",
  "amenity.swimming_pool": "Piscina",
  "amenity.reduced_mobility": "Movilidad reducida",

  "cond.second": "Segunda mano · buen estado",
  "cond.new": "Obra nueva",
  "cond.reform": "Para reformar",

  "type.Piso": "Piso",
  "type.Casa o chalet": "Casa o chalet",
  "type.Casa o chalet independiente": "Casa o chalet independiente",
  "type.Ático": "Ático",
  "type.Dúplex": "Dúplex",
  "type.Estudio": "Estudio",
  "type.Chalet adosado": "Chalet adosado",
  "type.Chalet pareado": "Chalet pareado",
  "type.Casa de pueblo": "Casa de pueblo",
  "type.Casa rural": "Casa rural",
  "type.Finca rústica": "Finca rústica",
  "type.Otros": "Otros",

  "prov.A Coruña": "A Coruña",
  "prov.Albacete": "Albacete",
  "prov.Alicante": "Alicante",
  "prov.Balears (Illes)": "Balears (Illes)",
  "prov.Barcelona": "Barcelona",
  "prov.Ciudad Real": "Ciudad Real",
  "prov.Cádiz": "Cádiz",
  "prov.Girona": "Girona",
  "prov.Guipúzcoa": "Guipúzcoa",
  "prov.Huelva": "Huelva",
  "prov.Madrid": "Madrid",
  "prov.Santa Cruz de Tenerife": "Santa Cruz de Tenerife",
  "prov.Segovia": "Segovia",
  "prov.Sevilla": "Sevilla",
  "prov.Soria": "Soria",
  "prov.Tarragona": "Tarragona",
  "prov.Valladolid": "Valladolid",
  "prov.València": "València",
  "prov.Vizcaya": "Vizcaya",
  "prov.Zamora": "Zamora",
  "prov.Álava": "Álava",

  "footer.index": "Proyecto educativo · Modelo entrenado con scikit-learn · Precios estimativos sin carácter vinculante",
  "footer.dashboard": "Proyecto educativo · Dashboard sobre el dataset inmobiliario español · Datos agregados anónimos",
};

export const CONDITION_VALUES: Record<string, string> = {
  "segunda mano/buen estado": "cond.second",
  "promoción de obra nueva": "cond.new",
  "segunda mano/para reformar": "cond.reform",
};

export const AMENITY_KEYS: Record<string, string> = {
  garage: "amenity.garage",
  lift: "amenity.lift",
  terrace: "amenity.terrace",
  balcony: "amenity.balcony",
  air_conditioner: "amenity.air_conditioner",
  built_in_wardrobe: "amenity.built_in_wardrobe",
  chimney: "amenity.chimney",
  garden: "amenity.garden",
  storage_room: "amenity.storage_room",
  swimming_pool: "amenity.swimming_pool",
  reduced_mobility: "amenity.reduced_mobility",
};

export const HOUSE_TYPE_KEYS: Record<string, string> = {
  Piso: "type.Piso",
  "Casa o chalet": "type.Casa o chalet",
  "Casa o chalet independiente": "type.Casa o chalet independiente",
  Ático: "type.Ático",
  Dúplex: "type.Dúplex",
  Estudio: "type.Estudio",
  "Chalet adosado": "type.Chalet adosado",
  "Chalet pareado": "type.Chalet pareado",
  "Casa de pueblo": "type.Casa de pueblo",
  "Casa rural": "type.Casa rural",
  "Finca rústica": "type.Finca rústica",
  Otros: "type.Otros",
};

export const PROVINCE_KEYS: Record<string, string> = {
  "A Coruña": "prov.A Coruña",
  Albacete: "prov.Albacete",
  Alicante: "prov.Alicante",
  "Balears (Illes)": "prov.Balears (Illes)",
  Barcelona: "prov.Barcelona",
  "Ciudad Real": "prov.Ciudad Real",
  Cádiz: "prov.Cádiz",
  Girona: "prov.Girona",
  Guipúzcoa: "prov.Guipúzcoa",
  Huelva: "prov.Huelva",
  Madrid: "prov.Madrid",
  "Santa Cruz de Tenerife": "prov.Santa Cruz de Tenerife",
  Segovia: "prov.Segovia",
  Sevilla: "prov.Sevilla",
  Soria: "prov.Soria",
  Tarragona: "prov.Tarragona",
  Valladolid: "prov.Valladolid",
  València: "prov.València",
  Vizcaya: "prov.Vizcaya",
  Zamora: "prov.Zamora",
  Álava: "prov.Álava",
};

export const DICTIONARIES: Record<Lang, Record<string, string>> = { en: EN, es: ES };

const STORAGE = {
  lang: "hv_lang",
  theme: "hv_theme",
  dashClicked: "hv_dash_clicked",
};

type Fn = (key: string, vars?: Record<string, string | number>) => string;

interface UIContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  theme: Theme;
  toggleTheme: () => void;
  t: Fn;
  formatPrice: (n: number) => string;
  formatNumber: (n: number) => string;
  houseTypeLabel: (key: string) => string;
  conditionLabel: (value: string) => string;
  amenityLabel: (key: string) => string;
  provinceLabel: (name: string) => string;
  heatFeatureLabel: (name: string) => string;
}

const UIContext = createContext<UIContextValue | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE.lang) : null;
    return saved === "es" || saved === "en" ? saved : "en";
  });

  const [theme, setTheme] = useState<Theme>(() => {
    const saved = typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE.theme) : null;
    return saved === "dark" ? "dark" : "light";
  });

  const [dashClicked, setDashClicked] = useState<boolean>(() => {
    return typeof localStorage !== "undefined"
      ? localStorage.getItem(STORAGE.dashClicked) === "1"
      : false;
  });

  useEffect(() => {
    document.documentElement.setAttribute("lang", lang);
    localStorage.setItem(STORAGE.lang, lang);
  }, [lang]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE.theme, theme);
  }, [theme]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);

  const toggleTheme = useCallback(() => {
    const from = theme;
    const to = theme === "light" ? "dark" : "light";
    if (typeof document !== "undefined") {
      const ov = document.createElement("div");
      ov.className = "theme-fade";
      ov.style.background = `linear-gradient(135deg, ${from === "light" ? "#f6f8fc" : "#0b1120"} 0%, ${to === "light" ? "#f6f8fc" : "#0b1120"} 100%)`;
      document.body.appendChild(ov);
      requestAnimationFrame(() => requestAnimationFrame(() => (ov.style.opacity = "0")));
      window.setTimeout(() => ov.remove(), 650);
    }
    setTheme(to);
  }, [theme]);

  const t: Fn = useCallback(
    (key, vars) => {
      let str = DICTIONARIES[lang][key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replace(`{${k}}`, String(v));
        }
      }
      return str;
    },
    [lang]
  );

  const formatPrice = useCallback(
    (n: number) =>
      new Intl.NumberFormat(lang === "es" ? "es-ES" : "en-IE", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
      }).format(n),
    [lang]
  );

  const formatNumber = useCallback(
    (n: number) => new Intl.NumberFormat(lang === "es" ? "es-ES" : "en-IE").format(n),
    [lang]
  );

  const houseTypeLabel = useCallback((key: string) => t(HOUSE_TYPE_KEYS[key] ?? key), [t]);
  const conditionLabel = useCallback((value: string) => t(CONDITION_VALUES[value] ?? value), [t]);
  const amenityLabel = useCallback((key: string) => t(AMENITY_KEYS[key] ?? key), [t]);
  const provinceLabel = useCallback((name: string) => t(PROVINCE_KEYS[name] ?? name), [t]);
  const heatFeatureLabel = useCallback((name: string) => t(`heat.${name}`), [t]);

  const value = useMemo(
    () => ({
      lang,
      setLang,
      theme,
      toggleTheme,
      t,
      formatPrice,
      formatNumber,
      houseTypeLabel,
      conditionLabel,
      amenityLabel,
      provinceLabel,
      heatFeatureLabel,
    }),
    [lang, setLang, theme, toggleTheme, t, formatPrice, formatNumber, houseTypeLabel, conditionLabel, amenityLabel, provinceLabel, heatFeatureLabel]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI(): UIContextValue {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used within UIProvider");
  return ctx;
}

export function isDashboardClicked(): boolean {
  try {
    return localStorage.getItem(STORAGE.dashClicked) === "1";
  } catch {
    return false;
  }
}

export function markDashboardClicked() {
  try {
    localStorage.setItem(STORAGE.dashClicked, "1");
  } catch {
    /* noop */
  }
}