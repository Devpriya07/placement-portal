import { getStudentProfile } from "@/actions/student";
import ProfileForm from "./ProfileForm";

export default async function StudentProfilePage() {
  const profile = await getStudentProfile();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
      <ProfileForm initialProfile={profile} />
    </div>
  );
}
