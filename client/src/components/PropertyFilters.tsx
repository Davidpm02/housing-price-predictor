import type { ReactNode } from "react";
import type { PropertyFilters } from "../lib/api";
import { EMPTY_FILTERS, hasFilters } from "../lib/api";
import { CONDITIONS, HOUSE_TYPES } from "../lib/geo";
import { useUI } from "../lib/ui";

interface Props {
  value: PropertyFilters;
  onChange: (filters: PropertyFilters) => void;
}

const AMENITY_KEYS: { key: string }[] = [
  { key: "garage" },
  { key: "lift" },
  { key: "terrace" },
  { key: "balcony" },
  { key: "air_conditioner" },
  { key: "built_in_wardrobe" },
  { key: "chimney" },
  { key: "garden" },
  { key: "storage_room" },
  { key: "swimming_pool" },
  { key: "reduced_mobility" },
];

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={`filter-chip ${active ? "active" : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function NumField({
  label,
  value,
  onChange,
  placeholder,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  suffix?: string;
}) {
  return (
    <label className="filter-field">
      <span className="filter-field-label">{label}</span>
      <div className="filter-field-input">
        <input
          type="number"
          min={0}
          inputMode="numeric"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {suffix && <span className="filter-field-suffix">{suffix}</span>}
      </div>
    </label>
  );
}

export default function PropertyFilters({ value, onChange }: Props) {
  const { t, houseTypeLabel, conditionLabel, amenityLabel } = useUI();

  function toggleList(
    key: "house_types" | "conditions" | "amenities",
    item: string
  ) {
    const list = value[key];
    const next = list.includes(item)
      ? list.filter((x) => x !== item)
      : [...list, item];
    onChange({ ...value, [key]: next });
  }

  function updateNum(key: "min_price" | "max_price" | "min_m2" | "min_rooms" | "min_baths", v: string) {
    if (v === "") {
      onChange({ ...value, [key]: "" });
      return;
    }
    const num = Number(v);
    if (Number.isFinite(num) && num >= 0) {
      onChange({ ...value, [key]: String(num) });
    }
  }

  const hasActiveFilters = hasFilters(value);

  return (
    <div className="property-filters">
      <div className="filter-head">
        <span className="filter-title">{t("filter.title")}</span>
        {hasActiveFilters && (
          <button
            type="button"
            className="filter-reset"
            onClick={() => onChange(EMPTY_FILTERS)}
          >
            {t("filter.clear")}
          </button>
        )}
      </div>

      <div className="filter-group">
        <span className="filter-group-label">{t("filter.price")}</span>
        <div className="filter-row">
          <NumField
            label={t("filter.min")}
            value={value.min_price}
            onChange={(v) => updateNum("min_price", v)}
            placeholder="0"
          />
          <NumField
            label={t("filter.max")}
            value={value.max_price}
            onChange={(v) => updateNum("max_price", v)}
            placeholder={t("filter.noLimit")}
          />
        </div>
      </div>

      <div className="filter-group">
        <span className="filter-group-label">{t("filter.limits")}</span>
        <NumField
          label={t("filter.minM2")}
          value={value.min_m2}
          onChange={(v) => updateNum("min_m2", v)}
          placeholder="0"
          suffix="m²"
        />
        <NumField
          label={t("filter.minRooms")}
          value={value.min_rooms}
          onChange={(v) => updateNum("min_rooms", v)}
          placeholder="0"
        />
        <NumField
          label={t("filter.minBaths")}
          value={value.min_baths}
          onChange={(v) => updateNum("min_baths", v)}
          placeholder="0"
        />
      </div>

      <div className="filter-group filter-group-chips">
        <span className="filter-group-label">{t("filter.houseType")}</span>
        <div className="filter-chips">
          {HOUSE_TYPES.map((ty) => (
            <Chip
              key={ty}
              active={value.house_types.includes(ty)}
              onClick={() => toggleList("house_types", ty)}
            >
              {houseTypeLabel(ty)}
            </Chip>
          ))}
        </div>
      </div>

      <div className="filter-group filter-group-chips">
        <span className="filter-group-label">{t("filter.condition")}</span>
        <div className="filter-chips">
          {CONDITIONS.map((c) => (
            <Chip
              key={c.value}
              active={value.conditions.includes(c.value)}
              onClick={() => toggleList("conditions", c.value)}
            >
              {conditionLabel(c.value)}
            </Chip>
          ))}
        </div>
      </div>

      <div className="filter-group filter-group-chips">
        <span className="filter-group-label">{t("filter.extras")}</span>
        <div className="filter-chips">
          {AMENITY_KEYS.map((a) => (
            <Chip
              key={a.key}
              active={value.amenities.includes(a.key)}
              onClick={() => toggleList("amenities", a.key)}
            >
              {amenityLabel(a.key)}
            </Chip>
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <div className="filter-active-hint">
          {t("filter.activeHint", {
            n: value.house_types.length + value.conditions.length + value.amenities.length,
          })}
        </div>
      )}
    </div>
  );
}