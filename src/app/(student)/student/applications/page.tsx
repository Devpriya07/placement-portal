import { getApplicationHistory } from "@/actions/student";
import ApplicationsTable from "./ApplicationsTable";

export default async function StudentApplicationsPage() {
  const applications = await getApplicationHistory();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
      <ApplicationsTable applications={applications} />
    </div>
  );
}
