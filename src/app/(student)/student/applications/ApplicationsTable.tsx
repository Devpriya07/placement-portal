"use client";

import { useState } from "react";
import ApplicationStatusBadge from "@/components/ApplicationStatusBadge";
import { withdrawApplication } from "@/actions/student";
import { formatDate } from "@/lib/utils";

export default function ApplicationsTable({ applications: initialApplications }: { applications: any[] }) {
  const [applications, setApplications] = useState(initialApplications);
  const [loadingAppId, setLoadingAppId] = useState<string | null>(null);

  const handleWithdraw = async (appId: string) => {
    if (!confirm("Are you sure you want to withdraw this application?")) return;
    
    setLoadingAppId(appId);
    try {
      const res = await withdrawApplication(appId);
      if (res.success) {
        setApplications(apps => apps.filter(app => app.id !== appId));
        alert("Application withdrawn successfully.");
      } else {
        alert(res.error || "Failed to withdraw application.");
      }
    } catch (err: any) {
      alert(err.message || "An unexpected error occurred.");
    } finally {
      setLoadingAppId(null);
    }
  };

  if (applications.length === 0) {
    return <div className="text-gray-500 py-8 bg-white rounded-lg shadow p-6 text-center">You have not applied to any drives yet.</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {applications.map((app) => (
            <tr key={app.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {app.drive?.company?.companyName || "N/A"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {app.drive?.jobTitle || "N/A"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(app.appliedAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <ApplicationStatusBadge status={app.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {app.status === "APPLIED" && (
                  <button
                    onClick={() => handleWithdraw(app.id)}
                    disabled={loadingAppId === app.id}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                  >
                    {loadingAppId === app.id ? "Withdrawing..." : "Withdraw"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
