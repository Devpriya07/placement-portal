"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateDrive } from "@/actions/company";

export default function EditDriveForm({ drive }: { drive: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);

    try {
      await updateDrive(drive.id, formData);
      router.push("/company/drives");
    } catch (err: any) {
      setError(err.message || "Failed to update drive");
    } finally {
      setLoading(false);
    }
  };

  const formattedDate = drive.deadline ? new Date(drive.deadline).toISOString().split('T')[0] : '';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
        <input
          type="text"
          name="jobTitle"
          defaultValue={drive.jobTitle}
          required
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
        <textarea
          name="jobDescription"
          defaultValue={drive.jobDescription || ""}
          rows={4}
          className="w-full border border-gray-300 rounded px-3 py-2"
        ></textarea>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Eligibility Criteria</label>
        <input
          type="text"
          name="eligibilityCriteria"
          defaultValue={drive.eligibilityCriteria || ""}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills</label>
        <input
          type="text"
          name="requiredSkills"
          defaultValue={drive.requiredSkills || ""}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Experience Required</label>
          <input
            type="text"
            name="experienceRequired"
            defaultValue={drive.experienceRequired || ""}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
          <input
            type="text"
            name="salaryRange"
            defaultValue={drive.salaryRange || ""}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Deadline *</label>
        <input
          type="date"
          name="deadline"
          defaultValue={formattedDate}
          required
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>
      <div className="pt-4">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update Drive"}
        </button>
      </div>
    </form>
  );
}
