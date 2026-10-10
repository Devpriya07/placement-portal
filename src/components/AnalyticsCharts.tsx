"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { Bar, Pie, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface AnalyticsChartsProps {
  statusCounts: Record<string, number>;
  monthlyDrives: Record<string, number>;
  deptCounts: Record<string, number>;
}

export default function AnalyticsCharts({ statusCounts, monthlyDrives, deptCounts }: AnalyticsChartsProps) {
  const statusData = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        data: Object.values(statusCounts),
        backgroundColor: [
          "rgba(59, 130, 246, 0.7)",
          "rgba(16, 185, 129, 0.7)",
          "rgba(239, 68, 68, 0.7)",
          "rgba(245, 158, 11, 0.7)",
          "rgba(107, 114, 128, 0.7)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const monthlyData = {
    labels: Object.keys(monthlyDrives),
    datasets: [
      {
        label: "Drives",
        data: Object.values(monthlyDrives),
        backgroundColor: "rgba(99, 102, 241, 0.7)",
        borderRadius: 4,
      },
    ],
  };

  const deptData = {
    labels: Object.keys(deptCounts),
    datasets: [
      {
        data: Object.values(deptCounts),
        backgroundColor: [
          "rgba(236, 72, 153, 0.7)",
          "rgba(139, 92, 246, 0.7)",
          "rgba(14, 165, 233, 0.7)",
          "rgba(20, 184, 166, 0.7)",
          "rgba(249, 115, 22, 0.7)",
          "rgba(99, 102, 241, 0.7)",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Applications by Status</h3>
        <div className="h-64 flex justify-center">
          <Pie data={statusData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Drives by Month</h3>
        <div className="h-64 flex justify-center">
          <Bar 
            data={monthlyData} 
            options={{ 
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
            }} 
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 lg:col-span-2">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Students by Department</h3>
        <div className="h-64 flex justify-center">
          <Doughnut data={deptData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
        </div>
      </div>
    </div>
  );
}
