"use client";

import { useState } from "react";
import { updateStudentProfile } from "@/actions/student";
import FileUpload from "@/components/FileUpload";

const DEPARTMENTS = ["CSE", "ECE", "ME", "EE", "CE", "IT"];

export default function ProfileForm({ initialProfile }: { initialProfile: any }) {
  const [fullName, setFullName] = useState(initialProfile?.fullName || initialProfile?.user?.username || "");
  const [phone, setPhone] = useState(initialProfile?.phone || "");
  const [department, setDepartment] = useState(initialProfile?.department || "CSE");
  const [cgpa, setCgpa] = useState<number | string>(initialProfile?.cgpa ?? 0);
  const [skills, setSkills] = useState(initialProfile?.skills || "");
  const [resumeFilename, setResumeFilename] = useState(initialProfile?.resumeFilename || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("phone", phone);
    formData.append("department", department);
    formData.append("cgpa", cgpa.toString());
    formData.append("skills", skills);
    if (resumeFilename) {
      formData.append("resumeFilename", resumeFilename);
    }

    try {
      const res = await updateStudentProfile(formData);
      if (res?.success) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
      } else {
        setMessage({ type: "error", text: "Failed to update profile." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "An unexpected error occurred." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {message && (
        <div
          className={`mb-4 p-4 rounded-md ${
            message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="text"
              name="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              name="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {DEPARTMENTS.map((dep) => (
                <option key={dep} value={dep}>
                  {dep}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CGPA (0-10)</label>
            <input
              type="number"
              name="cgpa"
              min="0"
              max="10"
              step="0.01"
              value={cgpa}
              onChange={(e) => setCgpa(e.target.value)}
              required
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated)</label>
          <input
            type="text"
            name="skills"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="e.g. React, Node.js, Python"
            className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Resume</label>
          {resumeFilename && (
            <div className="mb-2 text-sm text-gray-600 flex items-center gap-2">
              Current resume: <span className="font-semibold">{resumeFilename}</span>
              <a
                href={`/uploads/${resumeFilename}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View
              </a>
            </div>
          )}
          <FileUpload
            currentFile={resumeFilename}
            onUploadComplete={(filename) => {
              setResumeFilename(filename);
              setMessage({ type: "success", text: "Resume uploaded! Save profile to finalize." });
            }}
          />
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
