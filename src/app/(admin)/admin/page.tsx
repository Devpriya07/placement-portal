import { getAdminStats, getAnalyticsData } from "@/actions/admin";
import DashboardCard from "@/components/DashboardCard";
import AnalyticsCharts from "@/components/AnalyticsCharts";

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();
  const analytics = await getAnalyticsData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-2">Welcome back! Here is an overview of the placement portal.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard 
          title="Total Students" 
          value={stats.totalStudents} 
          icon="📚" 
          color="bg-blue-500" 
        />
        <DashboardCard 
          title="Total Companies" 
          value={stats.totalCompanies} 
          icon="🏢" 
          color="bg-green-500" 
        />
        <DashboardCard 
          title="Active Drives" 
          value={stats.totalDrives} 
          icon="💼" 
          color="bg-purple-500" 
        />
        <DashboardCard 
          title="Total Applications" 
          value={stats.totalApplications} 
          icon="📋" 
          color="bg-orange-500" 
        />
        <DashboardCard 
          title="Placements" 
          value={stats.totalPlacements} 
          icon="🎯" 
          color="bg-emerald-500" 
        />
        <DashboardCard 
          title="Pending Approvals" 
          value={stats.pendingCompanies} 
          icon="⏳" 
          color="bg-yellow-500" 
        />
      </div>

      <div className="mt-8">
        <AnalyticsCharts 
          statusCounts={analytics.statusCounts}
          monthlyDrives={analytics.monthlyDrives}
          deptCounts={analytics.deptCounts}
        />
      </div>
    </div>
  );
}
