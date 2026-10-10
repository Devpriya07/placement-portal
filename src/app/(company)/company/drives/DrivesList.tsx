"use client";

import { useState } from "react";
import Link from "next/link";
import { closeDrive, deleteDrive } from "@/actions/company";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function DrivesList({ drives }: { drives: any[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleClose = async (id: string) => {
    setLoadingId(`close-${id}`);
    try {
      await closeDrive(id);
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this drive?")) return;
    setLoadingId(`delete-${id}`);
    try {
      await deleteDrive(id);
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingId(null);
    }
  };

  if (!drives || drives.length === 0) {
    return <div className="text-gray-500">No drives found. Create one to get started.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {drives.map((drive) => (
        <div key={drive.id} className="bg-white p-6 rounded-lg shadow border border-gray-100 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <Link href={`/company/drives/${drive.id}`} className="text-xl font-semibold text-blue-600 hover:underline">
              {drive.jobTitle}
            </Link>
            <span
              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                drive.status === "OPEN" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
              }`}
            >
              {drive.status}
            </span>
          </div>
          <div className="text-sm text-gray-600 space-y-2 flex-grow">
            <p><strong>Deadline:</strong> {formatDate(drive.deadline)}</p>
            <p><strong>Applicants:</strong> {drive.applications?.length || 0}</p>
            <p><strong>Created:</strong> {formatDate(drive.createdAt)}</p>
          </div>
          <div className="mt-6 flex space-x-3">
            {drive.status === "OPEN" && (
              <>
                <Link
                  href={`/company/drives/${drive.id}/edit`}
                  className="flex-1 bg-gray-100 text-gray-700 text-center py-2 rounded hover:bg-gray-200 transition text-sm font-medium"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleClose(drive.id)}
                  disabled={loadingId === `close-${drive.id}`}
                  className="flex-1 bg-yellow-100 text-yellow-700 py-2 rounded hover:bg-yellow-200 transition text-sm font-medium disabled:opacity-50"
                >
                  {loadingId === `close-${drive.id}` ? "..." : "Close"}
                </button>
              </>
            )}
            <button
              onClick={() => handleDelete(drive.id)}
              disabled={loadingId === `delete-${drive.id}`}
              className="flex-1 bg-red-100 text-red-700 py-2 rounded hover:bg-red-200 transition text-sm font-medium disabled:opacity-50"
            >
              {loadingId === `delete-${drive.id}` ? "..." : "Delete"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
