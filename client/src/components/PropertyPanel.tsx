import { useEffect, useState } from "react";
import type { PropertyListItem } from "../lib/api";
import type { PropertyFilters as PropertyFiltersState } from "../lib/api";
import { EMPTY_FILTERS, fetchProperties } from "../lib/api";
import { houseTypeImage } from "../lib/houseImages";
import PropertyDetailModal from "./PropertyDetailModal";
import PropertyFilters from "./PropertyFilters";
import { useUI } from "../lib/ui";

interface Props {
  province: string;
  onClose: () => void;
}

const LIMIT = 8;

interface Column {
  key: string;
  label: string;
  type: "asc" | "desc";
}

export default function PropertyPanel({ province, onClose }: Props) {
  const { t, formatPrice, formatNumber, houseTypeLabel, provinceLabel } = useUI();
  const [items, setItems] = useState<PropertyListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [resultTotal, setResultTotal] = useState<number | null>(null);
  const [selectedHouseId, setSelectedHouseId] = useState<number | null>(null);
  const [filters, setFilters] = useState<PropertyFiltersState>(EMPTY_FILTERS);
  const [sortBy, setSortBy] = useState<{ key: string; type: "asc" | "desc" }>({
    key: "price",
    type: "desc",
  });

  const total = resultTotal ?? 0;
  const pages = Math.max(1, Math.ceil(total / LIMIT));

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchProperties(province, LIMIT, (page - 1) * LIMIT, "", filters)
      .then((res) => {
        let list = res.items;
        if (sortBy.key === "price") {
          list = [...list].sort((a, b) =>
            sortBy.type === "asc" ? a.price - b.price : b.price - a.price
          );
        }
        setItems(list);
        setResultTotal(res.total);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [province, page, sortBy, filters]);

  useEffect(() => {
    setPage(1);
    setResultTotal(null);
    setItems([]);
  }, [province]);

  function handleFiltersChange(next: PropertyFiltersState) {
    setFilters(next);
    setPage(1);
  }

  const cols: Column[] = [
    { key: "price", label: t("panel.sort.price"), type: "desc" },
    { key: "m2", label: t("panel.sort.m2"), type: "asc" },
  ];

  function toggleSort(column: Column) {
    setSortBy((prev) => {
      if (prev.key === column.key) {
        return {
          key: column.key,
          type: prev.type === "asc" ? "desc" : "asc",
        };
      }
      return {
        key: column.key,
        type: column.type,
      };
    });
  }

  function getSortValue(item: PropertyListItem, key: string): number | string {
    if (key === "price") return item.price;
    if (key === "m2") return item.m2_real;
    return "";
  }

  return (
    <aside className="property-panel">
      <div className="property-panel-header">
        <div>
          <div className="property-panel-kicker">
            {t("panel.homesIn", { province: provinceLabel(province) })}
          </div>
          <div className="property-panel-sub">
            {t("panel.properties", { n: formatNumber(total) })}
          </div>
        </div>
        <button
          type="button"
          className="icon-btn"
          onClick={onClose}
          aria-label={t("panel.close")}
        >
          ✕
        </button>
      </div>

      <div className="property-panel-body">
        <PropertyFilters value={filters} onChange={handleFiltersChange} />

        <div className="property-panel-main">
          {error && <div className="form-error">{error}</div>}

          {items.length === 0 && loading ? (
            <div className="panel-loading">
              <span className="spinner" />
              <span>{t("panel.loading")}</span>
            </div>
          ) : (
            <div className="property-list">
              {items.length === 0 ? (
                <div className="panel-empty">
                  {t("panel.empty")}
                </div>
              ) : (
                items.map((p, i) => (
                  <article
                    key={p.house_id}
                    className="property-card"
                    onClick={() => setSelectedHouseId(p.house_id)}
                  >
                    <div className="property-thumb">
                      <img
                        src={houseTypeImage(p.house_type)}
                        alt=""
                        className="property-thumb-img"
                        loading="lazy"
                      />
                      <span className="property-thumb-overlay" />
                      <span className="property-thumb-type">{houseTypeLabel(p.house_type)}</span>
                    </div>
                    <div className="property-body">
                      <div className="property-price">{formatPrice(p.price)}</div>
                      <div className="property-location">
                        {p.full_location || `${p.city}, ${p.province}`}
                      </div>
                      <div className="property-stats">
                        <span>📐 {p.m2_real} m²</span>
                        <span>🛏 {p.room_num ?? "—"}</span>
                      </div>
                      <div className="property-cta">
                        <span className="btn-view" role="button">
                          {t("panel.viewDetail")}
                        </span>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          )}

          {items.length > 0 && (
            <div className="pagination">
              <button
                type="button"
                className="pagination-btn"
                disabled={page <= 1 || loading}
                onClick={() => setPage(page - 1)}
              >
                {t("panel.prev")}
              </button>
              <span className="pagination-info">
                {t("panel.page", { page, pages })}
                {loading && (
                  <span className="pagination-loading">{t("panel.loadingDot")}</span>
                )}
              </span>
              <button
                type="button"
                className="pagination-btn"
                disabled={page >= pages || loading}
                onClick={() => setPage(page + 1)}
              >
                {t("panel.next")}
              </button>
            </div>
          )}
        </div>
      </div>

      {selectedHouseId !== null && (
        <PropertyDetailModal
          houseId={selectedHouseId}
          onClose={() => setSelectedHouseId(null)}
        />
      )}
    </aside>
  );
}