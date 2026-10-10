import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default async function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "COMPANY") {
    redirect("/login");
  }

  const { approvalStatus } = session.user;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="COMPANY" />
      <div className="flex-1 ml-64 pt-16 p-8">
        {approvalStatus === "PENDING" && (
          <div className="mb-6 p-4 bg-yellow-100 text-yellow-800 rounded-md shadow-sm">
            Your company registration is pending admin approval. You can view your profile but cannot create drives yet.
          </div>
        )}
        {approvalStatus === "REJECTED" && (
          <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-md shadow-sm">
            Your company registration has been rejected. Please contact the administrator.
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
