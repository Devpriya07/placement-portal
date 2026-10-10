import { getAllApplications } from "@/actions/admin";
import ApplicationStatusBadge from "@/components/ApplicationStatusBadge";
import { formatDateTime } from "@/lib/utils";

export default async function AdminApplicationsPage() {
  const applications = await getAllApplications();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">All Applications</h1>
        <p className="text-gray-500 mt-2">View all student applications across placement drives.</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700">
                <th className="py-4 px-6">Student Name</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">Company</th>
                <th className="py-4 px-6">Drive Title</th>
                <th className="py-4 px-6">Applied Date</th>
                <th className="py-4 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
              {applications.map((app: any) => (
                <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 font-medium text-gray-900">{app.student?.fullName || "N/A"}</td>
                  <td className="py-4 px-6">{app.student?.user?.email || "N/A"}</td>
                  <td className="py-4 px-6">{app.drive?.company?.companyName || "N/A"}</td>
                  <td className="py-4 px-6">{app.drive?.jobTitle || "N/A"}</td>
                  <td className="py-4 px-6">{formatDateTime(new Date(app.appliedAt))}</td>
                  <td className="py-4 px-6">
                    <ApplicationStatusBadge status={app.status} />
                  </td>
                </tr>
              ))}
              {applications.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No applications found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
