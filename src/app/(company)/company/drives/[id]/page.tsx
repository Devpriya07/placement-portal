import { getDriveById } from "@/actions/company";
import ApplicantsTable from "./ApplicantsTable";
import { formatDate } from "@/lib/utils";

export default async function DriveDetailsPage({ params }: { params: { id: string } }) {
  const drive = await getDriveById(params.id);

  if (!drive) {
    return <div className="text-red-500 font-semibold p-8">Drive not found.</div>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-start">
          <h1 className="text-3xl font-bold text-gray-900">{drive.jobTitle}</h1>
          <span
            className={`px-3 py-1 text-sm font-semibold rounded-full ${
              drive.status === "OPEN" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
            }`}
          >
            {drive.status}
          </span>
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Job Details</h3>
            <p className="whitespace-pre-wrap text-sm">{drive.jobDescription}</p>
          </div>
          <div className="space-y-3 text-sm">
            <p><strong>Eligibility:</strong> {drive.eligibilityCriteria}</p>
            <p><strong>Required Skills:</strong> {drive.requiredSkills}</p>
            <p><strong>Experience:</strong> {drive.experienceRequired}</p>
            <p><strong>Salary Range:</strong> {drive.salaryRange}</p>
            <p><strong>Deadline:</strong> {formatDate(drive.deadline)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Applicants</h2>
        <ApplicantsTable applicants={drive.applications} />
      </div>
    </div>
  );
}
