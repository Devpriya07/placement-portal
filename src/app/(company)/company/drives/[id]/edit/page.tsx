import { getDriveById } from "@/actions/company";
import EditDriveForm from "./EditDriveForm";
import { notFound } from "next/navigation";

export default async function EditDrivePage({ params }: { params: { id: string } }) {
  const drive = await getDriveById(params.id);

  if (!drive) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Edit Placement Drive</h1>
      <EditDriveForm drive={drive} />
    </div>
  );
}
