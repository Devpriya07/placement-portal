import React from "react";
import { STATUS_COLORS } from "@/lib/utils";

interface ApplicationStatusBadgeProps {
  status: string;
}

export default function ApplicationStatusBadge({ status }: ApplicationStatusBadgeProps) {
  const colorClass = (STATUS_COLORS as Record<string, string>)[status] || "bg-gray-100 text-gray-800";

  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${colorClass}`}>
      {status}
    </span>
  );
}
