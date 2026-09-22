import { useLayoutEffect, useRef, useState } from "react";
import type { BoxPlotStat } from "../../lib/dashboardApi";
import { houseTypeColor } from "../../lib/dashboardApi";
import { useUI } from "../../lib/ui";

interface Props {
  data: BoxPlotStat[];
}

const ROW_H = 48;
const LABEL_W = 96;
const PAD = { top: 40, right: 24, bottom: 20, left: 12 };
const TIP_MIN = 330;
const TIP_MAX = 480;
const TIP_H = 94;


const truncateLabel = (raw: string, max: number): { text: string; full: string } => {
  if (raw.length <= max) return { text: raw, full: raw };
  const cut = max - 1 <= 0 ? "" : raw.slice(0, Math.max(1, max - 1)).trimEnd();
  return { text: cut + "…", full: raw };
};

export default function BoxPlot({ data }: Props) {
  const { t, formatPrice, formatNumber, houseTypeLabel } = useUI();
  const [hover, setHover] = useState<string | null>(null);
  const tipRef = useRef<SVGGElement>(null);
  const [tipW, setTipW] = useState<number>(0);

  const items = [...data].sort((a, b) => b.median - a.median);
  const W = 1200;
  const H = PAD.top + items.length * ROW_H + PAD.bottom;
  const allMax = Math.max(...items.map((d) => d.upper_fence));
  const chartW = W - LABEL_W - PAD.right;
  const toX = (v: number) => LABEL_W + (v / allMax) * chartW;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(allMax * f));

  useLayoutEffect(() => {
    if (!hover || !tipRef.current) return;
    let max = 0;
    tipRef.current.querySelectorAll("text").forEach((el) => {
      const len = (el as SVGTextElement).getComputedTextLength();
      if (len > max) max = len;
    });
    setTipW(Math.min(TIP_MAX, Math.max(TIP_MIN, Math.ceil(max) + 32)));
  }, [hover, formatPrice, formatNumber, t, houseTypeLabel]);

  const toStat = (): { x: number; y: number; d: BoxPlotStat } | null => {
    if (!hover) return null;
    const i = items.findIndex((it) => it.house_type === hover);
    if (i < 0) return null;
    return { x: toX(items[i].median), y: PAD.top + i * ROW_H + ROW_H / 2, d: items[i] };
  };
  const tip = toStat();

  return (
    <div className="boxplot-wrap">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ maxWidth: 1600 }}
        role="img"
        aria-label={t("dash.boxplot")}
      >
        {ticks.map((tk) => (
          <g key={tk}>
            <line
              x1={toX(tk)}
              y1={PAD.top - 6}
              x2={toX(tk)}
              y2={H - PAD.bottom + 6}
              stroke="var(--border)"
              strokeDasharray="3 3"
            />
            <text x={toX(tk)} y={H - PAD.bottom + 20} textAnchor="middle" fontSize={11} fill="var(--muted)">
              {formatNumber(tk)}
            </text>
          </g>
        ))}

        {items.map((d, i) => {
          const y = PAD.top + i * ROW_H + ROW_H / 2;
          const color = houseTypeColor(d.house_type);
          const isHover = d.house_type === hover;
          return (
            <g
              key={d.house_type}
              className="boxplot-row"
              onMouseEnter={() => setHover(d.house_type)}
              onMouseLeave={() => setHover(null)}
              opacity={hover && !isHover ? 0.35 : 1}
              style={{ cursor: "pointer" }}
            >
              <text x={LABEL_W - 12} y={y + 1} textAnchor="end" fontSize={12.5} fontWeight={isHover ? 800 : 600} fill="var(--ink)">
                {(() => {
                  const tl = truncateLabel(houseTypeLabel(d.house_type), Math.floor(LABEL_W / 4.6) - 1);
                  return (
                    <>
                      {tl.text}
                      {tl.full !== tl.text && <title>{tl.full}</title>}
                    </>
                  );
                })()}
              </text>
              <line x1={toX(d.lower_fence)} x2={toX(d.q1)} y1={y} y2={y} stroke={color} strokeWidth={2} />
              <line x1={toX(d.q3)} x2={toX(d.upper_fence)} y1={y} y2={y} stroke={color} strokeWidth={2} />
              <line x1={toX(d.lower_fence)} y1={y - 7} y2={y + 7} stroke={color} strokeWidth={2} />
              <line x1={toX(d.upper_fence)} y1={y - 7} y2={y + 7} stroke={color} strokeWidth={2} />
              <rect
                x={toX(d.q1)}
                y={y - 15}
                width={Math.max(toX(d.q3) - toX(d.q1), 1)}
                height={30}
                rx={4}
                fill={color}
                opacity={0.75}
              />
              <line x1={toX(d.median)} x2={toX(d.median)} y1={y - 15} y2={y + 15} stroke="#fff" strokeWidth={3} />
            </g>
          );
        })}

        {/* Tooltip — ÚLTIMO hijo del <svg>: se pinta por ENCIMA de todas las filas */}
        {tip && (
          <g ref={tipRef} pointerEvents="none">
            {/* offset del tooltip: a la izquierda de la línea mediana, ancho auto-medido */}
            <rect
              x={Math.max(PAD.left, Math.min(W - tipW - 16, tip.x - tipW - 14))}
              y={tip.y - TIP_H / 2}
              width={tipW}
              height={TIP_H}
              rx={10}
              fill="var(--ink)"
              opacity={0.97}
              stroke="var(--border)"
            />
            <g transform={`translate(${Math.max(PAD.left + 6, Math.min(W - tipW - 22, tip.x - tipW - 8))}, ${tip.y - TIP_H / 2 + 20})`}>
              <text fontSize={13} fontWeight={700} fill="var(--bg)">
                {houseTypeLabel(tip.d.house_type)}
              </text>
              <text y={24} fontSize={12} fill="var(--muted)">
                {t("box.median")}: {formatPrice(tip.d.median)}
              </text>
              <text y={44} fontSize={12} fill="var(--muted)">
                {t("box.q1")}: {formatPrice(tip.d.q1)} · {t("box.q3")}: {formatPrice(tip.d.q3)}
              </text>
              <text y={64} fontSize={11.5} fill="var(--muted)">
                {t("box.outliers")}: {formatNumber(tip.d.outliers)} ({formatPrice(tip.d.lower_fence)} – {formatPrice(tip.d.upper_fence)})
              </text>
            </g>
          </g>
        )}
      </svg>
      <div className="boxplot-note">{t("dash.boxplotNote")}</div>
    </div>
  );
}
