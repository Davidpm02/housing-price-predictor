import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";

import Heatmap from "./dashboard/Heatmap";
import ProvinceTypeChart from "./dashboard/ProvinceTypeChart";
import HeaderControls from "./HeaderControls";
import type {
  AmenityResponse,
  ConditionStat,
  Correlation,
  HouseTypeStats,
  M2Bucket,
  PriceBucket,
  ProvinceCountRow,
  ProvinceStats,
  ProvinceTypeRow,
  ScatterPoint,
  SummaryStats,
} from "../lib/dashboardApi";
import {
  fetchAmenities,
  fetchConditions,
  fetchCorrelation,
  fetchHouseTypes,
  fetchM2Buckets,
  fetchPriceDistribution,
  fetchProvinces,
  fetchProvinceCounts,
  fetchProvinceType,
  fetchScatter,
  fetchSummary,
  houseTypeColor,
} from "../lib/dashboardApi";
import { useUI } from "../lib/ui";

const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  boxShadow: "0 10px 30px rgba(15,23,42,0.15)",
  fontSize: 13,
};

/* ---------- Tarjeta contenedora ---------- */
const SPAN_CLASS: Record<string, string> = {
  4: "chart-card-span-4",
  5: "chart-card-span-5",
  6: "chart-card-span-6",
  7: "chart-card-span-7",
  8: "chart-card-span-8",
  12: "chart-card-span-12",
};

function ChartCard({
  title,
  subtitle,
  children,
  span = 6,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  span?: 4 | 5 | 6 | 7 | 8 | 12;
}) {
  return (
    <section className={`chart-card ${SPAN_CLASS[span] ?? ""}`}>
      <header className="chart-card-head">
        <h3>{title}</h3>
        {subtitle && <p>{subtitle}</p>}
      </header>
      <div className="chart-card-body">{children}</div>
    </section>
  );
}

/* ---------- KPI ---------- */
function KpiCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: string;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="kpi-card">
      <div className="kpi-icon">{icon}</div>
      <div>
        <p className="kpi-label">{label}</p>
        <p className="kpi-value">{value}</p>
        {hint && <p className="kpi-hint">{hint}</p>}
      </div>
    </div>
  );
}

/* ---------- Página ---------- */
export default function Dashboard() {
  const { t, lang, formatPrice, formatNumber, houseTypeLabel, conditionLabel, amenityLabel, provinceLabel } = useUI();
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [houseTypes, setHouseTypes] = useState<HouseTypeStats[]>([]);
  const [provinces, setProvinces] = useState<ProvinceStats[]>([]);
  const [buckets, setBuckets] = useState<PriceBucket[]>([]);
  const [scatter, setScatter] = useState<ScatterPoint[]>([]);
  const [amenities, setAmenities] = useState<AmenityResponse | null>(null);
  const [conditions, setConditions] = useState<ConditionStat[]>([]);
  const [m2Buckets, setM2Buckets] = useState<M2Bucket[]>([]);
  const [correlation, setCorrelation] = useState<Correlation | null>(null);
  const [provinceType, setProvinceType] = useState<ProvinceTypeRow[]>([]);
  const [provinceCounts, setProvinceCounts] = useState<ProvinceCountRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Dashboard Spanish Housing Dataset · HomeValue";
  }, []);

  useEffect(() => {
    Promise.all([
      fetchSummary(),
      fetchHouseTypes(),
      fetchProvinces(),
      fetchPriceDistribution(),
      fetchScatter(3000),
      fetchAmenities(),
      fetchConditions(),
      fetchM2Buckets(),
      fetchCorrelation(),
      fetchProvinceType(),
      fetchProvinceCounts(),
    ])
      .then(
        ([
          s,
          ht,
          p,
          b,
          sc,
          am,
          co,
          mb,
          cor,
          pt,
          pc,
        ]) => {
          setSummary(s);
          setHouseTypes(ht);
          setProvinces(p);
          setBuckets(b);
          setScatter(sc);
          setAmenities(am);
          setConditions(co);
          setM2Buckets(mb);
          setCorrelation(cor);
          setProvinceType(pt);
          setProvinceCounts(pc);
        }
      )
      .catch((e) => setError(String(e)));
  }, []);

  const amenitiesMapped = amenities
    ? {
        ...amenities,
        items: amenities.items.map((a) => ({
          ...a,
          label: amenityLabel(a.key),
        })),
      }
    : null;

  if (error) {
    return (
      <div className="dashboard-error">
        <h2>{t("dash.errorLoad")}</h2>
        <pre>{error}</pre>
        <a href="/" className="btn-dashboard-back">
          {t("back.home")}
        </a>
      </div>
    );
  }

  const topProvinces = provinces.slice(0, 12);
  const scatterByType = scatter.filter((p) => p.price > 20000 && p.price < 1500000);
  const typeLegend = [...new Set(scatterByType.map((p) => p.house_type))].slice(0, 8);

  return (
    <div className="dashboard-page">
      {/* Header propio del dashboard */}
      <header className="dashboard-header">
        <div className="container dashboard-header-inner">
          <a href="/" className="brand">
            <span className="brand-mark">🏡</span>
            <span className="brand-name">
              Home<span>Value</span>
            </span>
          </a>
          <nav className="dashboard-nav">
            <a href="/" className="btn-dashboard-back">
              {t("back.home")}
            </a>
          </nav>
          <div className="dashboard-right">
            <HeaderControls />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="dashboard-hero">
        <div className="hero-canvas">
          <div className="hero-blob hero-blob-1" />
          <div className="hero-blob hero-blob-2" />
        </div>
        <div className="container">
          <span className="hero-eyebrow">{t("dash.eyebrow")}</span>
          <h1 className="dashboard-hero-title">{t("dash.title")}</h1>
          <p className="dashboard-hero-sub">{t("dash.sub")}</p>

          {summary && (
            <div className="kpi-grid">
              <KpiCard
                icon="🏠"
                label={t("kpi.homes")}
                value={formatNumber(summary.total)}
                hint={t("kpi.homesHint", { n: formatNumber(summary.total_all) })}
              />
              <KpiCard
                icon="💰"
                label={t("kpi.avgPrice")}
                value={formatPrice(summary.avg_price)}
                hint={`${formatPrice(summary.avg_price_per_m2)} / m²`}
              />
              <KpiCard
                icon="📐"
                label={t("kpi.avgSurface")}
                value={`${formatNumber(Math.round(summary.avg_m2))} m²`}
                hint="m²"
              />
              <KpiCard
                icon="🛏️"
                label={t("kpi.avgRooms")}
                value={String(summary.avg_rooms)}
                hint={`${formatNumber(summary.avg_baths)} ${t("modal.baths")}`}
              />
              <KpiCard
                icon="🗺️"
                label={t("kpi.coverage")}
                value={`${formatNumber(summary.total_provinces)} ${t("map.units")}`}
                hint={`${summary.total_ccaas} CCAA`}
              />
            </div>
          )}
        </div>
      </section>

      <main className="container dashboard-main">
        {/* Grid de gráficos */}
        <div className="dashboard-grid">
          <ChartCard
            title={t("dash.priceDist")}
            subtitle={t("dash.priceDistSub")}
            span={12}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={buckets} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                  height={64}
                />
                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} width={55} />
                <Tooltip
                  cursor={{ fill: "rgba(37,99,235,0.08)" }}
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(v: any) => [formatNumber(v), t("map.units")]}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title={t("dash.composition")}
            subtitle={t("dash.compositionSub")}
            span={5}
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={houseTypes}
                  dataKey="total"
                  nameKey="house_type"
                  cx="50%"
                  cy="46%"
                  innerRadius={58}
                  outerRadius={92}
                  paddingAngle={2}
                >
                  {houseTypes.map((h) => (
                    <Cell key={h.house_type} fill={houseTypeColor(h.house_type)} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(v: any, name: any) => [
                    formatNumber(v),
                    houseTypeLabel(String(name)),
                  ]}
                />
                <Legend
                  layout="horizontal"
                  align="center"
                  verticalAlign="bottom"
                  iconSize={9}
                  wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
                  formatter={(v: string) => (
                    <span style={{ fontSize: 11, color: "#334155" }}>
                      {houseTypeLabel(v)}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title={t("dash.avgByType")}
            subtitle={t("dash.avgByTypeSub")}
            span={7}
          >
            <ResponsiveContainer width="100%" height={380}>
              <BarChart
                data={houseTypes}
                layout="vertical"
                margin={{ top: 4, right: 60, left: 8, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickFormatter={(v: any) => `${Math.round(v / 1000)}k €`}
                />
                <YAxis
                  type="category"
                  dataKey="house_type"
                  tick={{ fontSize: 12, fill: "#334155" }}
                  width={176}
                  tickFormatter={(v: any) => houseTypeLabel(String(v))}
                />
                <Tooltip
                  cursor={{ fill: "rgba(37,99,235,0.08)" }}
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(v: any) => [formatPrice(v), t("dash.price")]}
                />
                <Bar dataKey="avg_price" radius={[0, 6, 6, 0]} maxBarSize={20}>
                  {houseTypes.map((h) => (
                    <Cell key={h.house_type} fill={houseTypeColor(h.house_type)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title={t("dash.condition")}
            subtitle={t("dash.conditionSub")}
            span={6}
          >
            <ResponsiveContainer width="100%" height={380}>
              <PieChart>
                <Pie
                  data={conditions}
                  dataKey="total"
                  nameKey="condition"
                  cx="50%"
                  cy="46%"
                  innerRadius={58}
                  outerRadius={92}
                  paddingAngle={3}
                >
                  <Cell fill="#2563eb" />
                  <Cell fill="#f59e0b" />
                  <Cell fill="#10b981" />
                </Pie>
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(v: any, name: any) => [
                    formatNumber(v),
                    conditionLabel(String(name)),
                  ]}
                />
                <Legend
                  layout="horizontal"
                  align="center"
                  verticalAlign="bottom"
                  iconSize={9}
                  wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
                  formatter={(v: string) => (
                    <span style={{ fontSize: 11, color: "#334155" }}>
                      {conditionLabel(v)}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title={t("dash.provincePpm")}
            subtitle={t("dash.provincePpmSub")}
            span={6}
          >
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={topProvinces} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="province"
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                  height={70}
                  tickFormatter={(v: any) => provinceLabel(String(v))}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  width={55}
                  tickFormatter={(v: any) => `${v} €`}
                />
                <Tooltip
                  cursor={{ fill: "rgba(37,99,235,0.08)" }}
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(v: any, name: any) => [
                    name === "avg_price_per_m2"
                      ? `Avg: ${formatPrice(v)}/m²`
                      : formatPrice(v),
                    "",
                  ]}
                />
                <Bar
                  dataKey="avg_price_per_m2"
                  fill="#8b5cf6"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={38}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title={t("dash.provinceCounts")}
            subtitle={t("dash.provinceCountsSub")}
            span={12}
          >
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={provinceCounts} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="province"
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                  height={70}
                  tickFormatter={(v: any) => provinceLabel(String(v))}
                />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} width={55} />
                <Tooltip
                  cursor={{ fill: "rgba(37,99,235,0.08)" }}
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(v: any) => [formatNumber(v), t("map.units")]}
                />
                <Bar dataKey="total" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={38} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title={t("dash.provinceType")}
            subtitle={t("dash.provinceTypeSub")}
            span={12}
          >
            {provinceType.length > 0 ? (
              <ProvinceTypeChart data={provinceType} />
            ) : (
              <p className="chart-empty">{t("dash.noData")}</p>
            )}
          </ChartCard>

          <ChartCard
            title={t("dash.scatter")}
            subtitle={t("dash.scatter", { n: formatNumber(scatterByType.length) })}
            span={8}
          >
            <ResponsiveContainer width="100%" height={360}>
              <ScatterChart margin={{ top: 12, right: 16, bottom: 12, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  type="number"
                  dataKey="m2_real"
                  name={t("dash.surfaceAxis")}
                  unit=" m²"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  domain={[0, 600]}
                />
                <YAxis
                  type="number"
                  dataKey="price"
                  name={t("dash.price")}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickFormatter={(v: any) => `${Math.round(v / 1000)}k €`}
                  domain={[0, 1200000]}
                />
                <ZAxis range={[28, 28]} />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(v: any, name: any) => [
                    String(name) === t("dash.surfaceAxis") ? `${v} m²` : formatPrice(v),
                    name,
                  ]}
                />
                <Scatter data={scatterByType} isAnimationActive={false}>
                  {scatterByType.map((p, i) => (
                    <Cell key={i} fill={houseTypeColor(p.house_type)} fillOpacity={0.75} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            <div className="scatter-legend">
              {typeLegend.map((ty) => (
                <span key={ty} className="scatter-legend-item">
                  <i style={{ background: houseTypeColor(ty) }} />
                  {houseTypeLabel(ty)}
                </span>
              ))}
            </div>
          </ChartCard>

          <ChartCard
            title={t("dash.extras")}
            subtitle={t("dash.extrasSub")}
            span={4}
          >
            <ResponsiveContainer width="100%" height={360}>
              <BarChart
                data={amenitiesMapped?.items ?? []}
                layout="vertical"
                margin={{ top: 4, right: 50, left: 8, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickFormatter={(v: any) => `${v}%`}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#334155" }}
                  width={118}
                />
                <Tooltip
                  cursor={{ fill: "rgba(37,99,235,0.08)" }}
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(v: any) => [`${v}%`, t("dash.pct")]}
                />
                <Bar dataKey="pct" fill="#10b981" radius={[0, 6, 6, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title={t("dash.trend")}
            subtitle={t("dash.trendSub")}
            span={12}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={m2Buckets} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="bucket"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  label={{
                    value: t("dash.surfaceAxis"),
                    position: "insideBottom",
                    offset: -4,
                    fill: "#64748b",
                    fontSize: 12,
                  }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  width={65}
                  tickFormatter={(v: any) => `${v} €`}
                />
                <Tooltip
                  cursor={{ fill: "rgba(37,99,235,0.08)" }}
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(v: any, name: any) => [
                    name === "avg_price_per_m2"
                      ? `${formatPrice(v)} / m²`
                      : formatPrice(v),
                    name === "avg_price_per_m2" ? t("modal.pricePerM2") : t("dash.price"),
                  ]}
                />
                <Bar
                  dataKey="avg_price_per_m2"
                  fill="url(#gradM2)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={44}
                />
                <defs>
                  <linearGradient id="gradM2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0d9488" />
                    <stop offset="100%" stopColor="#2563eb" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title={t("dash.heatmap")}
            subtitle={t("dash.heatmapSub")}
            span={12}
          >
            {correlation && correlation.features.length > 0 ? (
              <Heatmap data={correlation} />
            ) : (
              <p className="chart-empty">{t("dash.noData")}</p>
            )}
          </ChartCard>
        </div>
      </main>

      <footer className="site-footer">
        <div className="container">{t("footer.dashboard")}</div>
      </footer>
    </div>
  );
}