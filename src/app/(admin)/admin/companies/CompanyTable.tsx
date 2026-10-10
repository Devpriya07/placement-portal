"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { approveCompany, rejectCompany, blacklistCompany, unblacklistCompany } from "@/actions/admin";
import { APPROVAL_COLORS } from "@/lib/utils";

export default function CompanyTable({ companies }: { companies: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleAction = async (action: Function, companyId: string, actionName: string) => {
    setLoading(`${actionName}-${companyId}`);
    try {
      await action(companyId);
      router.refresh();
    } catch (error) {
      console.error(`Failed to ${actionName} company`, error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-100 border-b border-gray-200 text-sm font-medium text-gray-700">
            <th className="py-4 px-6">Company Name</th>
            <th className="py-4 px-6">Email</th>
            <th className="py-4 px-6">Industry</th>
            <th className="py-4 px-6">Status</th>
            <th className="py-4 px-6">Blacklisted</th>
            <th className="py-4 px-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
          {companies.map((company) => (
            <tr key={company.id} className="hover:bg-gray-50 transition-colors">
              <td className="py-4 px-6 font-medium text-gray-900">{company.companyName}</td>
              <td className="py-4 px-6">{company.user?.email || "N/A"}</td>
              <td className="py-4 px-6">{company.industry || "N/A"}</td>
              <td className="py-4 px-6">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${APPROVAL_COLORS[company.approvalStatus as keyof typeof APPROVAL_COLORS] || 'bg-gray-100 text-gray-800'}`}>
                  {company.approvalStatus}
                </span>
              </td>
              <td className="py-4 px-6">
                {company.isBlacklisted ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">Yes</span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">No</span>
                )}
              </td>
              <td className="py-4 px-6 text-right space-x-2">
                {company.approvalStatus === "PENDING" && (
                  <>
                    <button
                      onClick={() => handleAction(approveCompany, company.id, "approve")}
                      disabled={loading === `approve-${company.id}`}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      {loading === `approve-${company.id}` ? "..." : "Approve"}
                    </button>
                    <button
                      onClick={() => handleAction(rejectCompany, company.id, "reject")}
                      disabled={loading === `reject-${company.id}`}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      {loading === `reject-${company.id}` ? "..." : "Reject"}
                    </button>
                  </>
                )}
                
                {company.isBlacklisted ? (
                  <button
                    onClick={() => handleAction(unblacklistCompany, company.id, "unblacklist")}
                    disabled={loading === `unblacklist-${company.id}`}
                    className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
                  >
                    {loading === `unblacklist-${company.id}` ? "..." : "Unblacklist"}
                  </button>
                ) : (
                  <button
                    onClick={() => handleAction(blacklistCompany, company.id, "blacklist")}
                    disabled={loading === `blacklist-${company.id}`}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-gray-800 rounded-md hover:bg-gray-900 disabled:opacity-50"
                  >
                    {loading === `blacklist-${company.id}` ? "..." : "Blacklist"}
                  </button>
                )}
              </td>
            </tr>
          ))}
          {companies.length === 0 && (
            <tr>
              <td colSpan={6} className="py-8 text-center text-gray-500">
                No companies found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
