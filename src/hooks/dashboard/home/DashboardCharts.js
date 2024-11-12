import React from "react";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export function DashboardCharts({ stats }) {
  const chartData = {
    labels: stats.dailyIncomes.map(([date]) => date),
    datasets: [
      {
        label: "Pendapatan Harian",
        data: stats.dailyIncomes.map(([, amount]) => amount),
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
        animation: {
          duration: 2000,
          easing: "easeInOutQuart",
        },
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Grafik Pendapatan 7 Hari Terakhir",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `Rp ${value.toLocaleString()}`,
        },
      },
    },
  };

  const productChartData = {
    labels: stats.productStats.map((item) => item.name),
    datasets: [
      {
        label: "Stok Produk",
        data: stats.productStats.map((item) => item.stock),
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
          "rgba(153, 102, 255, 0.5)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const productChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Stok Produk Teratas",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div
      className="charts-container"
      style={{ display: "flex", gap: "20px", marginTop: "20px" }}
    >
      <div className="chart" style={{ flex: 1 }}>
        <div className="chart-container">
          <div className="chart-wrapper">
            <div className="chart-content">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      <div className="chart" style={{ flex: 1 }}>
        <div className="chart-container">
          <div className="chart-wrapper">
            <div className="chart-content">
              <Line data={productChartData} options={productChartOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
