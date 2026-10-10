import { getCompanyStats } from "@/actions/company";
import Link from "next/link";

export default async function CompanyDashboard() {
  const stats = await getCompanyStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Company Dashboard</h1>
        <Link
          href="/company/drives/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Create New Drive
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center space-x-4">
            <div className="text-3xl">💼</div>
            <div>
              <p className="text-sm text-gray-500">Total Drives</p>
              <h3 className="text-2xl font-bold">{stats.totalDrives}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center space-x-4">
            <div className="text-3xl">🟢</div>
            <div>
              <p className="text-sm text-gray-500">Open Drives</p>
              <h3 className="text-2xl font-bold">{stats.openDrives}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center space-x-4">
            <div className="text-3xl">👥</div>
            <div>
              <p className="text-sm text-gray-500">Total Applicants</p>
              <h3 className="text-2xl font-bold">{stats.totalApplications}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-emerald-500">
          <div className="flex items-center space-x-4">
            <div className="text-3xl">🎯</div>
            <div>
              <p className="text-sm text-gray-500">Placements</p>
              <h3 className="text-2xl font-bold">{stats.placements}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
