import { getAllUsers } from "@/actions/admin";
import UsersTable from "./UsersTable";

export default async function AdminUsersPage() {
  const users = await getAllUsers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-500 mt-2">Manage all registered users, control access, and handle blacklisting.</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <UsersTable students={users.students} companies={users.companies} />
      </div>
    </div>
  );
}
