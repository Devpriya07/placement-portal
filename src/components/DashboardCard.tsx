import React from "react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}

export default function DashboardCard({ title, value, icon, color }: DashboardCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 flex items-center">
      <div className={`${color} text-white w-14 h-14 flex items-center justify-center rounded-full text-2xl flex-shrink-0`}>
        {icon}
      </div>
      <div className="ml-5">
        <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">{title}</h3>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
    </div>
  );
}
