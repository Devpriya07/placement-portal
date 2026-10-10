import { getStudentStats } from "@/actions/student";
import DashboardCard from "@/components/DashboardCard";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "STUDENT") {
    redirect("/login");
  }

  const stats = await getStudentStats();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard
          title="Total Applications"
          value={stats.totalApplications}
          icon="📋"
          color="bg-blue-500"
        />
        <DashboardCard
          title="Shortlisted/Interview"
          value={stats.shortlisted}
          icon="⭐"
          color="bg-yellow-500"
        />
        <DashboardCard
          title="Placed"
          value={stats.placed}
          icon="🎉"
          color="bg-green-500"
        />
      </div>

      <div className="flex space-x-4 mt-8">
        <Link 
          href="/student/drives" 
          className="px-6 py-3 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition"
        >
          Browse Drives
        </Link>
        <Link 
          href="/student/applications" 
          className="px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-md shadow hover:bg-gray-50 transition"
        >
          View Applications
        </Link>
      </div>
    </div>
  );
}
