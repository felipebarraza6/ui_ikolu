import { useMemo } from "react";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

export type ChartSeries = {
  label: string;
  color: string;
  values: Array<number | null>;
  dashed?: boolean;
  fill?: boolean;
};

export function SeriesChart({ labels, series }: { labels: string[]; series: ChartSeries[] }) {
  const data = useMemo(
    () => ({
      labels,
      datasets: series.map((item) => ({
        label: item.label,
        data: item.values,
        borderColor: item.color,
        backgroundColor: item.fill ? `${item.color}33` : item.color,
        pointRadius: labels.length > 48 ? 0 : 2,
        borderWidth: 2,
        tension: 0.25,
        spanGaps: true,
        fill: Boolean(item.fill),
        borderDash: item.dashed ? [6, 4] : undefined,
      })),
    }),
    [labels, series]
  );

  return (
    <div className="h-56">
      <Line
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: {
              labels: { boxWidth: 10, font: { family: "Lato, sans-serif", weight: "bold", size: 11 } },
            },
            tooltip: {
              callbacks: {
                label(context) {
                  const value = context.parsed.y;
                  if (value === null || Number.isNaN(value)) return `${context.dataset.label}: —`;
                  return `${context.dataset.label}: ${value.toLocaleString("es-CL")}`;
                },
              },
            },
          },
          scales: {
            x: {
              ticks: { maxTicksLimit: 8, font: { family: "Roboto, sans-serif", size: 10 } },
              grid: { display: false },
            },
            y: {
              ticks: { font: { family: "Roboto, sans-serif", size: 10 } },
              grid: { color: "rgba(32,53,98,0.08)" },
            },
          },
        }}
      />
    </div>
  );
}
