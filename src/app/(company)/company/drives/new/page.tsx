"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createDrive } from "@/actions/company";

export default function NewDrivePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);

    try {
      await createDrive(formData);
      router.push("/company/drives");
    } catch (err: any) {
      setError(err.message || "Failed to create drive");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Create New Placement Drive</h1>
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
          <input
            type="text"
            name="jobTitle"
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
          <textarea
            name="jobDescription"
            rows={4}
            className="w-full border border-gray-300 rounded px-3 py-2"
          ></textarea>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Eligibility Criteria</label>
          <input
            type="text"
            name="eligibilityCriteria"
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills</label>
          <input
            type="text"
            name="requiredSkills"
            placeholder="e.g. React, Node.js, Python"
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Experience Required</label>
            <input
              type="text"
              name="experienceRequired"
              placeholder="e.g. 0-1 years"
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
            <input
              type="text"
              name="salaryRange"
              placeholder="e.g. 5LPA - 8LPA"
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Deadline *</label>
          <input
            type="date"
            name="deadline"
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
            {loading ? "Creating..." : "Create Drive"}
          </button>
        </div>
      </form>
    </div>
  );
}
