import React from "react";

interface DriveProps {
  id: string;
  jobTitle: string;
  jobDescription: string;
  salaryRange: string;
  deadline: Date | string;
  status: string;
  requiredSkills: string;
  company?: {
    companyName: string;
    industry?: string | null;
  };
  _count?: {
    applications: number;
  };
}

interface DriveCardProps {
  drive: DriveProps;
  showApply?: boolean;
  onApply?: (id: string) => void;
  applied?: boolean;
  isApplying?: boolean;
}

export default function DriveCard({ drive, showApply, onApply, applied, isApplying }: DriveCardProps) {
  const isClosed = drive.status === "CLOSED";
  const deadlineDate = new Date(drive.deadline);
  
  return (
    <div className="bg-white rounded-xl shadow-md p-6 flex flex-col h-full border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{drive.jobTitle}</h3>
          {drive.company && (
            <p className="text-indigo-600 font-medium">{drive.company.companyName}</p>
          )}
        </div>
        {isClosed ? (
          <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full whitespace-nowrap">Closed</span>
        ) : (
          <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full whitespace-nowrap">Open</span>
        )}
      </div>

      <div className="space-y-2 text-sm text-gray-600 flex-grow">
        <p className="line-clamp-2">{drive.jobDescription}</p>
        <div className="pt-2">
          <p><span className="font-semibold text-gray-700">Salary:</span> {drive.salaryRange}</p>
          <p><span className="font-semibold text-gray-700">Deadline:</span> {deadlineDate.toLocaleDateString()}</p>
          {drive._count !== undefined && (
            <p><span className="font-semibold text-gray-700">Applicants:</span> {drive._count.applications}</p>
          )}
        </div>
        
        <div className="mt-3 flex flex-wrap gap-2 pt-2">
          {drive.requiredSkills.split(",").map((skill, index) => {
            const trimmed = skill.trim();
            if (!trimmed) return null;
            return (
              <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                {trimmed}
              </span>
            );
          })}
        </div>
      </div>

      {(showApply || applied) && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          {applied ? (
            <div className="w-full text-center py-2 bg-green-50 text-green-700 rounded-lg font-medium border border-green-200">
              ✓ Applied
            </div>
          ) : (
            <button
              onClick={() => onApply && onApply(drive.id)}
              disabled={isClosed || isApplying}
              className={`w-full py-2 rounded-lg font-medium transition-colors ${
                isClosed || isApplying
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
              }`}
            >
              {isApplying ? "Applying..." : "Apply Now"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
