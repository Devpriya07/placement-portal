"use client";

import { useState } from "react";
import DriveCard from "@/components/DriveCard";
import { applyToDrive } from "@/actions/student";

export default function DrivesGrid({ initialDrives, studentApplications }: { initialDrives: any[], studentApplications: string[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [applied, setApplied] = useState<Set<string>>(new Set(studentApplications));
  const [loadingDrive, setLoadingDrive] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const filteredDrives = initialDrives.filter(drive => {
    const query = searchQuery.toLowerCase();
    const title = (drive.jobTitle || "").toLowerCase();
    const company = (drive.company?.companyName || "").toLowerCase();
    const skills = (drive.requiredSkills || "").toLowerCase();
    return (
      title.includes(query) ||
      company.includes(query) ||
      skills.includes(query)
    );
  });

  const handleApply = async (driveId: string) => {
    setLoadingDrive(driveId);
    setMessage(null);
    try {
      const res = await applyToDrive(driveId);
      if (res.success) {
        setApplied(prev => new Set(prev).add(driveId));
        setMessage({ type: 'success', text: "Successfully applied to drive!" });
      } else {
        setMessage({ type: 'error', text: res.error || "Failed to apply." });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || "An unexpected error occurred." });
    } finally {
      setLoadingDrive(null);
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}
      
      <div>
        <input
          type="text"
          placeholder="Search by title, skills, or company..."
          className="w-full p-3 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredDrives.length === 0 ? (
        <div className="text-gray-500 text-center py-8">No drives found matching your search.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrives.map(drive => {
            const hasApplied = applied.has(drive.id);
            return (
              <DriveCard
                key={drive.id}
                drive={drive}
                showApply={!hasApplied}
                onApply={() => handleApply(drive.id)}
                isApplying={loadingDrive === drive.id}
                applied={hasApplied}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
