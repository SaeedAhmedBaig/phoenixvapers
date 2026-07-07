"use client";

import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function TopProductsChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="py-8 text-center text-muted-foreground">No product data available</div>;
  }

  const labels = data.map((d) => d.name || "Unknown");
  const revenue = data.map((d) => (d.revenueMinor / 100).toFixed(2));
  const units = data.map((d) => d.unitsSold);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Revenue (£)",
        data: revenue,
        backgroundColor: "rgb(28, 173, 96)",
        borderColor: "rgb(24, 150, 85)",
        borderWidth: 1,
        yAxisID: "y",
      },
      {
        label: "Units Sold",
        data: units,
        backgroundColor: "rgb(52, 211, 153)",
        borderColor: "rgb(45, 180, 130)",
        borderWidth: 1,
        yAxisID: "y1",
      },
    ],
  };

  const options = {
    responsive: true,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        labels: {
          color: "rgb(100, 116, 139)",
          font: { weight: "bold" },
        },
      },
    },
    scales: {
      y: {
        type: "linear",
        display: true,
        position: "left",
        title: { display: true, text: "Revenue (£)", color: "rgb(100, 116, 139)" },
        ticks: { color: "rgb(100, 116, 139)" },
        grid: { color: "rgba(100, 116, 139, 0.1)" },
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        title: { display: true, text: "Units", color: "rgb(100, 116, 139)" },
        ticks: { color: "rgb(100, 116, 139)" },
        grid: { drawOnChartArea: false },
      },
      x: {
        ticks: { color: "rgb(100, 116, 139)" },
        grid: { color: "rgba(100, 116, 139, 0.1)" },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
}
