import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { PropertyDetail } from "../lib/api";
import { fetchPropertyDetail } from "../lib/api";
import { useUI } from "../lib/ui";

interface Props {
  houseId: number;
  onClose: () => void;
}

const GRADIENTS = [
  "linear-gradient(135deg,#2563eb,#1d4ed8)",
  "linear-gradient(135deg,#0ea5e9,#0284c7)",
  "linear-gradient(135deg,#6366f1,#4f46e5)",
  "linear-gradient(135deg,#14b8a6,#0d9488)",
  "linear-gradient(135deg,#f59e0b,#d97706)",
];

const HOUSE_ICONS: Record<string, string> = {
  "Casa de pueblo": "🏡",
  "Casa o chalet": "🏠",
  "Casa o chalet independiente": "🏠",
  "Casa rural": "🏡",
  "Chalet adosado": "🏘️",
  "Chalet pareado": "🏘️",
  "Dúplex": "🏢",
  Estudio: "🛏️",
  "Finca rústica": "🌾",
  Otros: "🏠",
  Piso: "🏢",
  Ático: "☀️",
};

function iconForType(houseType: string, index: number): string {
  return HOUSE_ICONS[houseType] ?? GRADIENTS[index % GRADIENTS.length];
}

function flag(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return value === 1 ? "✓" : "✗";
}

export default function PropertyDetailModal({ houseId, onClose }: Props) {
  const { t, lang, formatPrice, provinceLabel, conditionLabel } = useUI();
  const [detail, setDetail] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchPropertyDetail(houseId)
      .then((d) => {
        if (!cancelled) {
          setDetail(d);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [houseId]);

  // Cerrar con Escape y bloquear el scroll del fondo.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  function formatNum(value: number | null | undefined, suffix = ""): string {
    if (value === null || value === undefined) return "—";
    const hasDecimals = value % 1 !== 0;
    return (
      new Intl.NumberFormat(
        lang === "es" ? "es-ES" : "en-IE",
        { maximumFractionDigits: hasDecimals ? 1 : 0 }
      ).format(value) + suffix
    );
  }

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={t("modal.detail")}
      >
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label={t("panel.close")}
        >
          ✕
        </button>

        {loading ? (
          <div className="panel-loading">
            <span className="spinner" />
            <span>{t("panel.loadingDetail")}</span>
          </div>
        ) : error ? (
          <div className="form-error">{error}</div>
        ) : detail ? (
          <DetailContent
            detail={detail}
            t={t}
            formatPrice={formatPrice}
            formatNum={formatNum}
            provinceLabel={provinceLabel}
            conditionLabel={conditionLabel}
          />
        ) : null}
      </div>
    </div>,
    document.body
  );
}

function DetailContent({
  detail,
  t,
  formatPrice,
  formatNum,
  provinceLabel,
  conditionLabel,
}: {
  detail: PropertyDetail;
  t: (k: string, v?: Record<string, string | number>) => string;
  formatPrice: (n: number) => string;
  formatNum: (n: number | null | undefined, s?: string) => string;
  provinceLabel: (n: string) => string;
  conditionLabel: (v: string) => string;
}) {
  const bannerBg = GRADIENTS[detail.house_id % GRADIENTS.length];
  const houseIcon = HOUSE_ICONS[detail.house_type] ?? "🏠";

  const specItems = [
    { label: t("modal.pricePerM2"), value: formatPrice(detail.price_per_m2 ?? 0) },
    { label: t("modal.m2useful"), value: formatNum(detail.m2_useful, " m²") },
    { label: t("modal.rooms"), value: formatNum(detail.room_num) },
    { label: t("modal.baths"), value: formatNum(detail.bath_num) },
    { label: t("modal.floor"), value: detail.floor ?? "—" },
    { label: t("modal.condition"), value: conditionLabel(detail.condition ?? "—") },
    { label: t("modal.garage"), value: detail.garage ?? "—" },
    { label: t("modal.energy"), value: detail.energetic_certif ?? "—" },
  ];

  const featureItems = [
    { label: t("amenity.terrace"), value: flag(detail.terrace) },
    { label: t("amenity.balcony"), value: flag(detail.balcony) },
    { label: t("amenity.lift"), value: flag(detail.lift) },
    { label: t("amenity.built_in_wardrobe"), value: flag(detail.built_in_wardrobe) },
    { label: t("amenity.chimney"), value: flag(detail.chimney) },
    { label: t("amenity.garden"), value: flag(detail.garden) },
    { label: t("amenity.storage_room"), value: flag(detail.storage_room) },
    { label: t("amenity.swimming_pool"), value: flag(detail.swimming_pool) },
    { label: t("amenity.air_conditioner"), value: flag(detail.air_conditioner) },
    { label: t("amenity.reduced_mobility"), value: flag(detail.reduced_mobility) },
  ];

  return (
    <div className="modal-content">
      <div className="modal-hero" style={{ background: bannerBg }}>
        <div className="modal-hero-icon">{houseIcon}</div>
        <div className="modal-hero-text">
          <div className="modal-hero-type">{detail.house_type}</div>
          <div className="modal-hero-location">{detail.full_location || `${detail.city}, ${detail.province}`}</div>
        </div>
        <div className="modal-price">{formatPrice(detail.price)}</div>
      </div>

      <div className="modal-body">
        {detail.ad_description ? (
          <section className="modal-section">
            <h3 className="modal-section-title">{t("modal.description")}</h3>
            <FormattedDescription text={detail.ad_description} />
          </section>
        ) : null}

        <section className="modal-section">
          <h3 className="modal-section-title">{t("modal.features")}</h3>
          <div className="modal-grid">
            {specItems.map((i) => (
              <div key={i.label} className="modal-grid-item">
                <span className="modal-grid-label">{i.label}</span>
                <span className="modal-grid-value">{i.value}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="modal-section">
          <h3 className="modal-section-title">{t("modal.extras")}</h3>
          <div className="modal-features">
            {featureItems.map((f) => (
              <span
                key={f.label}
                className={`modal-feature ${f.value === "✓" ? "on" : ""}`}
              >
                {f.label} {f.value}
              </span>
            ))}
          </div>
        </section>

        <section className="modal-section">
          <h3 className="modal-section-title">{t("modal.location")}</h3>
          <div className="modal-grid">
            <div className="modal-grid-item">
              <span className="modal-grid-label">{t("modal.municipality")}</span>
              <span className="modal-grid-value">{detail.city || "—"}</span>
            </div>
            <div className="modal-grid-item">
              <span className="modal-grid-label">{t("modal.district")}</span>
              <span className="modal-grid-value">{detail.district ?? "—"}</span>
            </div>
            <div className="modal-grid-item">
              <span className="modal-grid-label">{t("modal.neighborhood")}</span>
              <span className="modal-grid-value">{detail.neighborhood ?? "—"}</span>
            </div>
            <div className="modal-grid-item">
              <span className="modal-grid-label">{t("modal.zone")}</span>
              <span className="modal-grid-value">{detail.zone ?? "—"}</span>
            </div>
            <div className="modal-grid-item">
              <span className="modal-grid-label">{t("modal.province")}</span>
              <span className="modal-grid-value">{provinceLabel(detail.province)}</span>
            </div>
            <div className="modal-grid-item">
              <span className="modal-grid-label">{t("modal.region")}</span>
              <span className="modal-grid-value">{detail.ccaa}</span>
            </div>
          </div>
        </section>

        {detail.ad_last_update ? (
          <p className="modal-meta">
            {t("modal.updated", { date: detail.ad_last_update })}
          </p>
        ) : null}
      </div>
    </div>
  );
}

// Convierte descripciones en bruto (con saltos de línea, comas y bullet
// points tipo "•"/"·"/"-") en párrafos y listas formateadas.
const BULLET_START = /^\s*[•·▪●○\-*]\s+/;
const BULLET_INLINE = /\s*,\s*([•·▪●○\-*])\s*/;

function FormattedDescription({ text }: { text: string }) {
  // Normaliza los separadores de lista para que queden en su propia línea:
  // " ,- " ",•" ". - " pasan a ser "\n- " "\n•" ...
  let normalized = text
    .replace(/\r\n/g, "\n")
    .replace(/\s*,\s*([•·▪●○\-*])\s*/g, "\n$1 ")
    .replace(/([.!?])\s+([•·▪●○\-*])\s+/g, "$1\n$2 ");

  const rawLines = normalized
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  let counter = 0;
  const lineId = () => {
    counter += 1;
    return counter;
  };

  function bulletText(line: string): string {
    return line.replace(BULLET_START, "").trim();
  }

  type Block =
    | { kind: "paragraph"; lines: string[] }
    | { kind: "list"; items: string[] };

  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];
  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ kind: "paragraph", lines: paragraph });
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      blocks.push({ kind: "list", items: list });
      list = [];
    }
  };

  for (const line of rawLines) {
    if (BULLET_START.test(line)) {
      flushParagraph();
      list.push(bulletText(line));
      continue;
    }
    // Quedan bullets incrustados en mitad de un párrafo: se trocea la línea.
    const inlineMatches = line.split(BULLET_INLINE);
    if (inlineMatches.length > 1) {
      flushParagraph();
      flushList();
      let current = inlineMatches[0].trim();
      for (let i = 1; i < inlineMatches.length; i += 2) {
        if (current) blocks.push({ kind: "paragraph", lines: [current] });
        list.push(inlineMatches[i + 1]?.trim() ?? "");
        current = "";
      }
      blocks.push({ kind: "list", items: list.splice(0) });
      continue;
    }
    flushList();
    paragraph.push(line);
  }
  flushParagraph();
  flushList();

  return (
    <div className="modal-description">
      {blocks.map((block) =>
        block.kind === "list" ? (
          <ul key={`ul-${lineId()}`} className="modal-description-list">
            {block.items.map((item) => (
              <li key={`li-${lineId()}`}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="modal-description-p" key={`p-${lineId()}`}>
            {block.lines.join(" ")}
          </p>
        )
      )}
    </div>
  );
}