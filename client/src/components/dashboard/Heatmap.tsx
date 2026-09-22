import { useState } from "react";
import type { Correlation } from "../../lib/dashboardApi";
import { colorScale } from "../../lib/dashboardApi";
import { useUI } from "../../lib/ui";

interface CellPos {
  row: number;
  col: number;
}

export default function Heatmap({ data }: { data: Correlation }) {
  const { heatFeatureLabel, theme } = useUI();
  const [hover, setHover] = useState<CellPos | null>(null);
  const isDark = theme === "dark";

  const n = data.features.length;
  const cell = 96; // tamaño de celda en px
  const pad = 90; // espacio para etiquetas en la izquierda/arriba
  const size = pad + n * cell;

  const value = (row: number, col: number) => data.matrix[row][col];
  const hovered = hover ? value(hover.row, hover.col) : null;

  return (
    <div className="heatmap-wrap">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ maxWidth: "100%", height: "auto" }}
        role="img"
        aria-label="Mapa de calor de correlaciones entre variables"
      >
        <defs>
          <linearGradient id="corr-scale" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1d4ed8" />
            <stop offset="50%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#0f766e" />
          </linearGradient>
        </defs>

        {/* etiquetas de fila/columna */}
        {data.features.map((f, i) => (
          <g key={f + i}>
            <text
              x={pad - 10}
              y={pad + i * cell + cell / 2}
              textAnchor="end"
              dominantBaseline="middle"
              className="heatmap-label"
            >
              {heatFeatureLabel(f)}
            </text>
            <text
              x={pad + i * cell + cell / 2}
              y={pad - 18}
              textAnchor="middle"
              className="heatmap-label"
            >
              {heatFeatureLabel(f)}
            </text>
          </g>
        ))}

        {/* celdas */}
        {data.matrix.map((row, r) =>
          row.map((v, c) => (
            <rect
              key={`${r}-${c}`}
              x={pad + c * cell}
              y={pad + r * cell}
              width={cell - 3}
              height={cell - 3}
              rx={6}
              fill={colorScale(v)}
              opacity={hover && (hover.row === r || hover.col === c) ? 1 : 0.92}
              stroke="rgba(255,255,255,0.5)"
              strokeWidth={hover && hover.row === r && hover.col === c ? 2 : 0}
              onMouseEnter={() => setHover({ row: r, col: c })}
              onMouseLeave={() => setHover(null)}
            >
              <title>
                {heatFeatureLabel(data.features[r])} ↔ {heatFeatureLabel(data.features[c])} = {v.toFixed(2)}
              </title>
            </rect>
          ))
        )}

        {/* valores dentro de la celda */}
        {data.matrix.map((row, r) =>
          row.map((v, c) => {
            const light = Math.abs(v) > 0.35;
            const fill = light ? "#fff" : isDark ? "#e2e8f0" : "#334155";
            return (
              <text
                key={`t${r}-${c}`}
                x={pad + c * cell + (cell - 3) / 2}
                y={pad + r * cell + (cell - 3) / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                className="heatmap-cell-text"
                fill={fill}
                stroke={light && isDark ? "rgba(0,0,0,0.35)" : "none"}
                strokeWidth={light && isDark ? 0.6 : 0}
                paintOrder="stroke"
                style={{ filter: !light && isDark ? "drop-shadow(0 1px 1px rgba(0,0,0,0.65))" : undefined }}
                pointerEvents="none"
              >
                {v.toFixed(2)}
              </text>
            );
          })
        )}
      </svg>

      <div className="heatmap-legend">
        <span>-1</span>
        <div
          className="heatmap-legend-bar"
          style={{ background: "linear-gradient(90deg,#1d4ed8,#f1f5f9,#0f766e)" }}
        />
        <span>+1</span>
        {hovered !== null && (
          <span className="heatmap-hover-value">
            {heatFeatureLabel(data.features[hover!.row])} ↔{" "}
            {heatFeatureLabel(data.features[hover!.col])} ={" "}
            {hovered.toFixed(2)}
          </span>
        )}
      </div>
    </div>
  );
}