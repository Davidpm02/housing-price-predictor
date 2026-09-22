import { useCallback, useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import SpainMap from "./components/SpainMap";
import ValuationForm from "./components/ValuationForm";
import PropertyPanel from "./components/PropertyPanel";
import { fetchCCAACounts, fetchProvinceCounts } from "./lib/api";
import type { CCAACount, ProvinceCount } from "./lib/geo";
import { aggregateByCCAA } from "./lib/provinceMap";
import { normalizeProvinceName } from "./lib/geo";
import { useUI } from "./lib/ui";

export default function App() {
  const { t, formatNumber } = useUI();
  const [provinceCounts, setProvinceCounts] = useState<ProvinceCount[]>([]);
  const [ccaaCounts, setCcaaCounts] = useState<CCAACount[]>([]);
  const [drilledCCAA, setDrilledCCAA] = useState<string | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [countsByCCAA, setCountsByCCAA] = useState<Map<string, number>>(
    new Map()
  );

  useEffect(() => {
    fetchProvinceCounts().then(setProvinceCounts).catch(() => {});
    fetchCCAACounts().then(setCcaaCounts).catch(() => {});
  }, []);

  const totalViviendas = useMemo(
    () => ccaaCounts.reduce((acc, c) => acc + c.total, 0),
    [ccaaCounts]
  );

  useEffect(() => {
    if (provinceCounts.length === 0) return;
    setCountsByCCAA(aggregateByCCAA(provinceCounts));
  }, [provinceCounts]);

  const handleDrill = useCallback((ccaa: string) => {
    setDrilledCCAA(ccaa);
    document.getElementById("mapa")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleSelectProvince = useCallback((province: string) => {
    setSelectedProvince(normalizeProvinceName(province));
  }, []);

  useEffect(() => {
    if (!selectedProvince) return;
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document
          .getElementById("lista")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [selectedProvince]);

  const handleReset = useCallback(() => {
    setDrilledCCAA(null);
    setSelectedProvince(null);
  }, []);

  const drilledCount =
    drilledCCAA && countsByCCAA.get(drilledCCAA) !== undefined
      ? (countsByCCAA.get(drilledCCAA) ?? 0)
      : provinceCounts.reduce((acc, c) => acc + c.total, 0);

  return (
    <>
      <Header />
      <main>
        {/* HERO + VALORACIÓN */}
        <section id="valoracion" className="hero">
          <div className="hero-canvas">
            <div className="hero-blob hero-blob-1" />
            <div className="hero-blob hero-blob-2" />
          </div>
          <div className="container hero-inner">
            <div className="hero-copy">
              <span className="hero-eyebrow">{t("hero.eyebrow")}</span>
              <h1 className="hero-title">
                {t("hero.title.start")}{" "}
                <span>{t("hero.title.highlight")}</span>{" "}
                {t("hero.title.end")}
              </h1>
              <p className="hero-sub">
                {t("hero.sub", { n: formatNumber(totalViviendas) })}
              </p>
              <ul className="hero-points">
                <li>{t("hero.point.speed")}</li>
                <li>{t("hero.point.coverage", { n: provinceCounts.length })}</li>
                <li>{t("hero.point.data")}</li>
              </ul>
            </div>
            <div className="hero-form">
              <ValuationForm />
            </div>
          </div>
        </section>

        {/* MAPA */}
        <section id="mapa" className="map-section">
          <div className="container">
            <div className="section-head map-head">
              <div>
                <span className="section-eyebrow">{t("map.eyebrow")}</span>
                <h2 className="section-title">
                  {drilledCCAA ? drilledCCAA : t("map.title")}
                </h2>
                <p className="section-sub">
                  {drilledCCAA
                    ? t("map.drilled.sub", { n: formatNumber(drilledCount) })
                    : t("map.sub")}
                </p>
              </div>
              {drilledCCAA && (
                <button className="back-btn" onClick={handleReset}>
                  {t("map.back")}
                </button>
              )}
            </div>

            <div className={`map-layout ${selectedProvince ? "has-panel" : ""}`}>
              <div className="map-container">
                <SpainMap
                  drilledCCAA={drilledCCAA}
                  provinceCounts={provinceCounts}
                  countsByCCAA={countsByCCAA}
                  selectedProvince={selectedProvince}
                  onSelectProvince={handleSelectProvince}
                  onDrill={handleDrill}
                />
              </div>
              {selectedProvince ? (
                <div id="lista">
                  <PropertyPanel
                    province={selectedProvince}
                    onClose={() => setSelectedProvince(null)}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="container">{t("footer.index")}</div>
      </footer>
    </>
  );
}