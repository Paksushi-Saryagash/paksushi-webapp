"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatTenge } from "@/lib/money";

type ChartPoint = {
  date: string;
  revenue: number;
  profit: number;
  orders: number;
};

const chartLabels: Record<string, string> = {
  revenue: "Выручка",
  profit: "Прибыль",
  orders: "Заказы"
};

export function AnalyticsChart({ data }: { data: ChartPoint[] }) {
  const hasMoney = data.some((point) => point.revenue > 0 || point.profit > 0);

  return (
    <div className="h-80 w-full">
      {!hasMoney ? (
        <div className="grid h-full place-items-center rounded-[8px] border border-dashed border-black/15 text-center text-sm font-bold text-black/45">
          Данные появятся после подтвержденных заказов за выбранные дни.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={72}
              tickFormatter={(value) => formatTenge(Number(value))}
            />
            <Tooltip
              formatter={(value, name) => [formatTenge(Number(value)), chartLabels[String(name)] ?? String(name)]}
              labelFormatter={(label) => `Дата: ${label}`}
            />
            <Legend formatter={(value) => chartLabels[String(value)] ?? String(value)} />
            <Bar dataKey="revenue" name="revenue" fill="#d3262f" radius={[4, 4, 0, 0]} />
            <Bar dataKey="profit" name="profit" fill="#17833b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
