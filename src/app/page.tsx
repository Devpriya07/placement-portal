import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    if (session.user.role === "ADMIN") redirect("/admin");
    if (session.user.role === "COMPANY") redirect("/company");
    if (session.user.role === "STUDENT") redirect("/student");
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl font-extrabold tracking-tight">Campus Placement Portal</h1>
          <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
            Connecting bright students with top companies. Manage your placement journey with ease.
          </p>
          <div className="flex justify-center gap-4">
            <Link 
              href="/register" 
              className="px-8 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg"
            >
              Get Started →
            </Link>
            <Link 
              href="/login" 
              className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white flex-grow">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Everything you need</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-semibold mb-3 text-indigo-600">For Students</h3>
              <p className="text-gray-600">Browse placement drives, apply with one click, and track your application status in real-time.</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-semibold mb-3 text-indigo-600">For Companies</h3>
              <p className="text-gray-600">Post new placement drives, manage applicants, and find the best talent for your organization.</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-semibold mb-3 text-indigo-600">For Admins</h3>
              <p className="text-gray-600">Full oversight of the placement process, analytics dashboard, and complete user management.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-100 py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-gray-800">500+</div>
            <div className="text-gray-600 mt-2 font-medium">Students Enrolled</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-gray-800">100+</div>
            <div className="text-gray-600 mt-2 font-medium">Partner Companies</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-gray-800">1000+</div>
            <div className="text-gray-600 mt-2 font-medium">Successful Placements</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-8 text-center">
        <p>&copy; {new Date().getFullYear()} Placement Portal. All rights reserved.</p>
      </footer>
    </div>
  );
}
