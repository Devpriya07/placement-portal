import { getCompanyProfile } from "@/actions/company";
import ProfileForm from "./ProfileForm";

export default async function CompanyProfilePage() {
  const profile = await getCompanyProfile();

  if (!profile) {
    return <div className="p-8 text-red-500">Profile not found.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-lg shadow flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your company details</p>
        </div>
        <div>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            profile.approvalStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
            profile.approvalStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {profile.approvalStatus}
          </span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <ProfileForm profile={profile} />
      </div>
    </div>
  );
}
