"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export function SalesChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="py-8 text-center text-muted-foreground">No sales data available</div>;
  }

  const labels = data.map((d) => d._id);
  const revenue = data.map((d) => (d.revenueMinor / 100).toFixed(2));
  const orders = data.map((d) => d.orders);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Revenue (£)",
        data: revenue,
        borderColor: "rgb(28, 173, 96)",
        backgroundColor: "rgba(28, 173, 96, 0.1)",
        tension: 0.4,
        fill: true,
        yAxisID: "y",
      },
      {
        label: "Orders",
        data: orders,
        borderColor: "rgb(52, 211, 153)",
        backgroundColor: "rgba(52, 211, 153, 0.1)",
        tension: 0.4,
        fill: true,
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
        title: { display: true, text: "Order Count", color: "rgb(100, 116, 139)" },
        ticks: { color: "rgb(100, 116, 139)" },
        grid: { drawOnChartArea: false },
      },
      x: {
        ticks: { color: "rgb(100, 116, 139)" },
        grid: { color: "rgba(100, 116, 139, 0.1)" },
      },
    },
  };

  return <Line data={chartData} options={options} />;
}
