import { useEffect, useState } from "react";
import {
  CONDITIONS,
  HOUSE_TYPES,
  MODEL_PROVINCES,
  type ProvinceCount,
} from "../lib/geo";
import { fetchPrediction, fetchProvinceCounts } from "../lib/api";
import { useUI } from "../lib/ui";

interface State {
  m2_real: string;
  room_num: string;
  bath_num: string;
  province: string;
  house_type: string;
  condition: string;
  house_floors: string;
  floor_number: string;
  amenities: Record<string, boolean>;
}

const DEFAULT_STATE: State = {
  m2_real: "",
  room_num: "",
  bath_num: "",
  province: "",
  house_type: "",
  condition: "",
  house_floors: "",
  floor_number: "",
  amenities: {
    garage: false,
    lift: false,
    terrace: false,
    balcony: false,
    air_conditioner: false,
    built_in_wardrobe: false,
    chimney: false,
    garden: false,
    storage_room: false,
    swimming_pool: false,
  },
};

const AMENITY_KEYS: { key: string }[] = [
  { key: "garage" },
  { key: "lift" },
  { key: "terrace" },
  { key: "balcony" },
  { key: "air_conditioner" },
  { key: "garden" },
  { key: "swimming_pool" },
  { key: "storage_room" },
  { key: "built_in_wardrobe" },
  { key: "chimney" },
];

export default function ValuationForm() {
  const { t, formatPrice, formatNumber, houseTypeLabel, conditionLabel, amenityLabel, provinceLabel } = useUI();
  const [form, setForm] = useState<State>(DEFAULT_STATE);
  const [counts, setCounts] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<number | null>(null);
  const [resultMeta, setResultMeta] = useState<{
    province: string;
    count: string | null;
  } | null>(null);

  useEffect(() => {
    fetchProvinceCounts()
      .then((data: ProvinceCount[]) => {
        setCounts(
          new Map(data.filter((d) => MODEL_PROVINCES.includes(d.province)).map((d) => [d.province, d.total]))
        );
      })
      .catch(() => {});
  }, []);

  const set = (field: keyof State, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));
  const toggleAmenity = (key: string) =>
    setForm((f) => ({
      ...f,
      amenities: { ...f.amenities, [key]: !f.amenities[key] },
    }));

  const canSubmit =
    !!form.m2_real &&
    !!form.room_num &&
    !!form.bath_num &&
    !!form.province &&
    !!form.house_type &&
    !!form.condition;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) {
      setError(t("form.error.required"));
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    setResultMeta(null);
    try {
      const prediction = await fetchPrediction({
        m2_real: parseInt(form.m2_real, 10),
        room_num: parseInt(form.room_num, 10),
        bath_num: parseInt(form.bath_num, 10),
        province: form.province,
        house_type: form.house_type,
        condition: form.condition,
        house_floors: form.house_floors ? parseInt(form.house_floors, 10) : undefined,
        floor_number: form.floor_number ? parseInt(form.floor_number, 10) : undefined,
        garage: form.amenities.garage ? 1 : 0,
        lift: form.amenities.lift ? 1 : 0,
        terrace: form.amenities.terrace ? 1 : 0,
        air_conditioner: form.amenities.air_conditioner ? 1 : 0,
        balcony: form.amenities.balcony ? 1 : 0,
        built_in_wardrobe: form.amenities.built_in_wardrobe ? 1 : 0,
        chimney: form.amenities.chimney ? 1 : 0,
        garden: form.amenities.garden ? 1 : 0,
        storage_room: form.amenities.storage_room ? 1 : 0,
        swimming_pool: form.amenities.swimming_pool ? 1 : 0,
      });
      setResult(prediction.prediction);
      setResultMeta({
        province: form.province,
        count:
          counts.get(form.province) != null
            ? formatNumber(counts.get(form.province)!)
            : null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("form.error.unknown"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="valuation-card" onSubmit={handleSubmit}>
      <div className="valuation-grid">
        {/* Ubicación */}
        <div className="form-section">
          <div className="form-section-title">{t("form.location")}</div>
          <label className="field">
            <span className="field-label">{t("form.province")}</span>
            <select
              value={form.province}
              onChange={(e) => set("province", e.target.value)}
              className={form.province ? "is-filled" : ""}
            >
              <option value="">{t("form.selectProvince")}</option>
              {MODEL_PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {provinceLabel(p)}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Características */}
        <div className="form-section">
          <div className="form-section-title">{t("form.features")}</div>
          <div className="field-row">
            <label className="field">
              <span className="field-label">{t("form.houseType")}</span>
              <select
                value={form.house_type}
                onChange={(e) => set("house_type", e.target.value)}
                className={form.house_type ? "is-filled" : ""}
              >
                <option value="">{t("form.selectType")}</option>
                {HOUSE_TYPES.map((ty) => (
                  <option key={ty} value={ty}>
                    {houseTypeLabel(ty)}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="field-label">{t("form.condition")}</span>
              <select
                value={form.condition}
                onChange={(e) => set("condition", e.target.value)}
                className={form.condition ? "is-filled" : ""}
              >
                <option value="">{t("form.selectCondition")}</option>
                {CONDITIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {conditionLabel(c.value)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* Superficie y distribución */}
        <div className="form-section">
          <div className="form-section-title">{t("form.dimensions")}</div>
          <div className="field-row">
            <label className="field">
              <span className="field-label">{t("form.m2")}</span>
              <input
                type="number"
                min={1}
                inputMode="numeric"
                placeholder="90"
                value={form.m2_real}
                onChange={(e) => set("m2_real", e.target.value)}
              />
            </label>
            <label className="field">
              <span className="field-label">{t("form.rooms")}</span>
              <input
                type="number"
                min={0}
                inputMode="numeric"
                placeholder="3"
                value={form.room_num}
                onChange={(e) => set("room_num", e.target.value)}
              />
            </label>
            <label className="field">
              <span className="field-label">{t("form.baths")}</span>
              <input
                type="number"
                min={0}
                inputMode="numeric"
                placeholder="2"
                value={form.bath_num}
                onChange={(e) => set("bath_num", e.target.value)}
              />
            </label>
          </div>
        </div>

        {/* Extras */}
        <div className="form-section">
          <div className="form-section-title">{t("form.extras")}</div>
          <div className="amenities">
            {AMENITY_KEYS.map((a) => (
              <button
                type="button"
                key={a.key}
                className={`amenity-chip ${form.amenities[a.key] ? "active" : ""}`}
                onClick={() => toggleAmenity(a.key)}
              >
                {amenityLabel(a.key)}
                <span className="amenity-check">✓</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="valuation-actions">
        <button type="submit" className="btn-estimate" disabled={loading}>
          {loading ? (
            <span className="spinner" />
          ) : (
            <>{t("form.estimate")}</>
          )}
        </button>
        {error && <div className="form-error">{error}</div>}
        {result !== null && resultMeta !== null && (
          <div className="result-card">
            <div className="result-kicker">{t("result.kicker")}</div>
            <div className="result-value">{formatPrice(result)}</div>
            <div className="result-note">
              {t("result.note", {
                n: resultMeta.count ?? "~",
                province: provinceLabel(resultMeta.province),
              })}
            </div>
          </div>
        )}
      </div>
    </form>
  );
}