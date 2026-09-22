import { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  Legend,
} from "recharts";
import type { ProvinceTypeRow } from "../../lib/dashboardApi";
import { houseTypeColor } from "../../lib/dashboardApi";
import { useUI } from "../../lib/ui";

const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  boxShadow: "0 10px 30px rgba(15,23,42,0.15)",
  fontSize: 13,
};

interface Props {
  data: ProvinceTypeRow[];
}

export default function ProvinceTypeChart({ data }: Props) {
  const { t, formatNumber, houseTypeLabel, provinceLabel } = useUI();
  const [selected, setSelected] = useState<string>("all");

  // tipos ordenados por frecuencia total desc
  const typeTotals = new Map<string, number>();
  for (const row of data) {
    for (const [ty, n] of Object.entries(row.types)) {
      typeTotals.set(ty, (typeTotals.get(ty) ?? 0) + n);
    }
  }
  const types = [...typeTotals.entries()].sort((a, b) => b[1] - a[1]).map(([ty]) => ty);
  const BASE_TYPES = types.slice(0, 8);

  const chartData = data.map((row) => {
    const item: Record<string, number | string> = {
      province: provinceLabel(row.province),
      total: row.total,
    };
    for (const ty of BASE_TYPES) item[ty] = row.types[ty] ?? 0;
    return item;
  });

  const filteredData =
    selected === "all"
      ? chartData
      : data
          .map((row) => ({
            province: provinceLabel(row.province),
            total: row.types[selected] ?? 0,
          }))
          .filter((r) => r.total > 0);

  const tipLabel =
    selected === "all"
      ? t("map.units")
      : `${houseTypeLabel(selected)} · ${t("map.units")}`;

  const legendFormatter = (v: string) => {
    const key = types.find((ty) => houseTypeLabel(ty) === v) ?? v;
    return <span style={{ fontSize: 11.5, color: "#334155" }}>{houseTypeLabel(key)}</span>;
  };

  return (
    <div className="provtype-wrap">
      <div className="provtype-controls">
        <label htmlFor="provtype-select">{t("dash.typeLabel")}</label>
        <select
          id="provtype-select"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          <option value="all">{t("dash.allTypes")}</option>
          {types.map((ty) => (
            <option key={ty} value={ty}>
              {houseTypeLabel(ty)}
            </option>
          ))}
        </select>
      </div>

      <ResponsiveContainer width="100%" height={380}>
        {selected === "all" ? (
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="province"
              tick={{ fontSize: 10, fill: "#64748b" }}
              interval={0}
              angle={-32}
              textAnchor="end"
              height={70}
            />
            <YAxis tick={{ fontSize: 11, fill: "#64748b" }} width={50} />
            <Tooltip
              cursor={{ fill: "rgba(37,99,235,0.08)" }}
              contentStyle={TOOLTIP_STYLE}
              formatter={(v: any, name: any) => [
                formatNumber(v),
                houseTypeLabel(String(name)),
              ]}
            />
            <Legend
              iconSize={10}
              formatter={legendFormatter}
              wrapperStyle={{ fontSize: 11 }}
            />
            {BASE_TYPES.map((ty) => (
              <Bar
                key={ty}
                dataKey={ty}
                stackId="comp"
                fill={houseTypeColor(ty)}
                maxBarSize={44}
              />
            ))}
          </BarChart>
        ) : (
          <BarChart data={filteredData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="province"
              tick={{ fontSize: 10, fill: "#64748b" }}
              interval={0}
              angle={-32}
              textAnchor="end"
              height={70}
            />
            <YAxis tick={{ fontSize: 11, fill: "#64748b" }} width={50} />
            <Tooltip
              cursor={{ fill: "rgba(37,99,235,0.08)" }}
              contentStyle={TOOLTIP_STYLE}
              formatter={(v: any) => [formatNumber(v), tipLabel]}
            />
            <Bar dataKey="total" maxBarSize={44} radius={[6, 6, 0, 0]}>
              {filteredData.map((d) => (
                <Cell key={d.province} fill={houseTypeColor(selected)} />
              ))}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}