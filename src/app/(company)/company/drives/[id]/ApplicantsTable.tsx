"use client";

import { useState } from "react";
import { updateApplicationStatus } from "@/actions/company";
import { APPLICATION_STATUSES, STATUS_COLORS } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function ApplicantsTable({ applicants }: { applicants: any[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    setLoadingId(applicationId);
    try {
      await updateApplicationStatus(applicationId, newStatus);
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingId(null);
    }
  };

  if (!applicants || applicants.length === 0) {
    return <div className="text-gray-500 py-4">No applicants yet.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th className="px-6 py-3">Name</th>
            <th className="px-6 py-3">Email</th>
            <th className="px-6 py-3">Department</th>
            <th className="px-6 py-3">CGPA</th>
            <th className="px-6 py-3">Skills</th>
            <th className="px-6 py-3">Resume</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {applicants.map((app) => (
            <tr key={app.id} className="bg-white border-b hover:bg-gray-50">
              <td className="px-6 py-4 font-medium text-gray-900">{app.student?.fullName || 'N/A'}</td>
              <td className="px-6 py-4">{app.student?.user?.email || 'N/A'}</td>
              <td className="px-6 py-4">{app.student?.department || 'N/A'}</td>
              <td className="px-6 py-4">{app.student?.cgpa || 'N/A'}</td>
              <td className="px-6 py-4 truncate max-w-xs">{app.student?.skills || 'N/A'}</td>
              <td className="px-6 py-4">
                {app.student?.resumeFilename ? (
                  <a
                    href={`/uploads/${app.student.resumeFilename}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </a>
                ) : (
                  <span className="text-gray-400">None</span>
                )}
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${STATUS_COLORS[app.status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-800'}`}>
                  {app.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <select
                  value={app.status}
                  disabled={loadingId === app.id}
                  onChange={(e) => handleStatusChange(app.id, e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded focus:ring-blue-500 focus:border-blue-500 block p-1 disabled:opacity-50"
                >
                  {APPLICATION_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
