"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  blacklistStudent,
  unblacklistStudent,
  blacklistCompany,
  unblacklistCompany,
  toggleUserActive,
} from "@/actions/admin";

interface UsersTableProps {
  students: any[];
  companies: any[];
}

export default function UsersTable({ students, companies }: UsersTableProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"STUDENT" | "COMPANY">("STUDENT");
  const [loading, setLoading] = useState<string | null>(null);

  const handleStudentBlacklist = async (studentId: string, currentStatus: boolean) => {
    setLoading(`blacklist-student-${studentId}`);
    try {
      if (currentStatus) await unblacklistStudent(studentId);
      else await blacklistStudent(studentId);
      router.refresh();
    } catch (error) {
      console.error("Failed to toggle blacklist", error);
    } finally {
      setLoading(null);
    }
  };

  const handleCompanyBlacklist = async (companyId: string, currentStatus: boolean) => {
    setLoading(`blacklist-company-${companyId}`);
    try {
      if (currentStatus) await unblacklistCompany(companyId);
      else await blacklistCompany(companyId);
      router.refresh();
    } catch (error) {
      console.error("Failed to toggle blacklist", error);
    } finally {
      setLoading(null);
    }
  };

  const handleActiveToggle = async (userId: string) => {
    setLoading(`active-${userId}`);
    try {
      await toggleUserActive(userId);
      router.refresh();
    } catch (error) {
      console.error("Failed to toggle active status", error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="w-full">
      <div className="flex border-b border-gray-200">
        <button
          className={`px-6 py-4 text-sm font-medium ${
            activeTab === "STUDENT"
              ? "border-b-2 border-blue-500 text-blue-600 font-semibold"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("STUDENT")}
        >
          Students ({students.length})
        </button>
        <button
          className={`px-6 py-4 text-sm font-medium ${
            activeTab === "COMPANY"
              ? "border-b-2 border-blue-500 text-blue-600 font-semibold"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("COMPANY")}
        >
          Companies ({companies.length})
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700">
              <th className="py-4 px-6">Name</th>
              <th className="py-4 px-6">Email / Username</th>
              <th className="py-4 px-6">{activeTab === "STUDENT" ? "Department & CGPA" : "Industry & Website"}</th>
              <th className="py-4 px-6">Account Status</th>
              <th className="py-4 px-6">Blacklisted</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
            {activeTab === "STUDENT" &&
              students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 font-medium text-gray-900">{student.fullName}</td>
                  <td className="py-4 px-6">
                    <div>{student.user.email}</div>
                    <div className="text-xs text-gray-500">@{student.user.username}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div>{student.department || "N/A"}</div>
                    <div className="text-xs text-gray-500">CGPA: {student.cgpa || "N/A"}</div>
                  </td>
                  <td className="py-4 px-6">
                    {student.user.isActive ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    {student.isBlacklisted ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                        Yes
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        No
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <button
                      onClick={() => handleActiveToggle(student.user.id)}
                      disabled={loading === `active-${student.user.id}`}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md disabled:opacity-50 ${
                        student.user.isActive
                          ? "text-orange-700 bg-orange-100 hover:bg-orange-200"
                          : "text-green-700 bg-green-100 hover:bg-green-200"
                      }`}
                    >
                      {loading === `active-${student.user.id}`
                        ? "..."
                        : student.user.isActive
                        ? "Deactivate"
                        : "Activate"}
                    </button>

                    <button
                      onClick={() => handleStudentBlacklist(student.id, student.isBlacklisted)}
                      disabled={loading === `blacklist-student-${student.id}`}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md disabled:opacity-50 ${
                        student.isBlacklisted
                          ? "text-gray-700 bg-gray-200 hover:bg-gray-300"
                          : "text-white bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      {loading === `blacklist-student-${student.id}`
                        ? "..."
                        : student.isBlacklisted
                        ? "Unblacklist"
                        : "Blacklist"}
                    </button>
                  </td>
                </tr>
              ))}

            {activeTab === "COMPANY" &&
              companies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 font-medium text-gray-900">{company.companyName}</td>
                  <td className="py-4 px-6">
                    <div>{company.user.email}</div>
                    <div className="text-xs text-gray-500">@{company.user.username}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div>{company.industry || "N/A"}</div>
                    <div className="text-xs text-gray-500">{company.website || "No website"}</div>
                  </td>
                  <td className="py-4 px-6">
                    {company.user.isActive ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    {company.isBlacklisted ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                        Yes
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        No
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <button
                      onClick={() => handleActiveToggle(company.user.id)}
                      disabled={loading === `active-${company.user.id}`}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md disabled:opacity-50 ${
                        company.user.isActive
                          ? "text-orange-700 bg-orange-100 hover:bg-orange-200"
                          : "text-green-700 bg-green-100 hover:bg-green-200"
                      }`}
                    >
                      {loading === `active-${company.user.id}`
                        ? "..."
                        : company.user.isActive
                        ? "Deactivate"
                        : "Activate"}
                    </button>

                    <button
                      onClick={() => handleCompanyBlacklist(company.id, company.isBlacklisted)}
                      disabled={loading === `blacklist-company-${company.id}`}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md disabled:opacity-50 ${
                        company.isBlacklisted
                          ? "text-gray-700 bg-gray-200 hover:bg-gray-300"
                          : "text-white bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      {loading === `blacklist-company-${company.id}`
                        ? "..."
                        : company.isBlacklisted
                        ? "Unblacklist"
                        : "Blacklist"}
                    </button>
                  </td>
                </tr>
              ))}

            {((activeTab === "STUDENT" && students.length === 0) ||
              (activeTab === "COMPANY" && companies.length === 0)) && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  No {activeTab.toLowerCase()}s found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
