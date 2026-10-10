import { getAllCompanies } from "@/actions/admin";
import CompanyTable from "./CompanyTable";

export default async function AdminCompaniesPage() {
  const companies = await getAllCompanies();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Company Management</h1>
        <p className="text-gray-500 mt-2">Manage registered companies, approve access, and handle blacklisting.</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <CompanyTable companies={companies} />
      </div>
    </div>
  );
}
