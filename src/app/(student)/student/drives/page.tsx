import { getOpenDrives, getApplicationHistory } from "@/actions/student";
import DrivesGrid from "./DrivesGrid";

export default async function StudentDrivesPage() {
  const drives = await getOpenDrives();
  const applications = await getApplicationHistory();
  
  // Extract driveIds that the student has already applied to
  const appliedDriveIds = applications.map((app: any) => app.placementDriveId);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Available Placement Drives</h1>
      <DrivesGrid initialDrives={drives} studentApplications={appliedDriveIds} />
    </div>
  );
}
