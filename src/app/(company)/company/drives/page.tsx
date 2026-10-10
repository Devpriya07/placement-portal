import { getCompanyDrives } from "@/actions/company";
import Link from "next/link";
import DrivesList from "./DrivesList";

export default async function CompanyDrivesPage() {
  const drives = await getCompanyDrives();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">My Placement Drives</h1>
        <Link
          href="/company/drives/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Create New Drive
        </Link>
      </div>

      <DrivesList drives={drives} />
    </div>
  );
}
