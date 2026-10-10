"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerStudent, registerCompany } from "@/actions/auth";

export default function RegisterPage() {
  const [tab, setTab] = useState<"student" | "company">("student");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  async function handleStudentSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await registerStudent(formData);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess("Registration successful! Redirecting to login...");
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCompanySubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await registerCompany(formData);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess("Registration successful! Your account is pending admin approval.");
        setTimeout(() => router.push("/login"), 3000);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12 mb-12 p-8 bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create an Account</h1>
        <p className="text-gray-500 mt-2">Join the placement portal</p>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-gray-100 rounded-lg mb-8">
        <button
          className={`flex-1 py-2 text-sm font-medium rounded-md transition ${tab === "student" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => setTab("student")}
          type="button"
        >
          Student
        </button>
        <button
          className={`flex-1 py-2 text-sm font-medium rounded-md transition ${tab === "company" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => setTab("company")}
          type="button"
        >
          Company
        </button>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-md text-sm font-medium border border-red-100">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-3 bg-green-50 text-green-700 rounded-md text-sm font-medium border border-green-100">
          {success}
        </div>
      )}

      {tab === "student" ? (
        <form onSubmit={handleStudentSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input name="name" type="text" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input name="username" type="text" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input name="email" type="email" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input name="password" type="password" required minLength={6} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <button type="submit" disabled={isLoading} className="w-full mt-2 bg-indigo-600 text-white font-semibold py-2.5 rounded-lg hover:bg-indigo-700 transition disabled:opacity-70">
            {isLoading ? "Registering..." : "Register as Student"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleCompanySubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input name="name" type="text" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input name="username" type="text" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input name="email" type="email" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input name="password" type="password" required minLength={6} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
            <input name="industry" type="text" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">HR Contact Email</label>
            <input name="contactEmail" type="email" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <input name="website" type="url" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="https://" />
          </div>
          <button type="submit" disabled={isLoading} className="w-full mt-2 bg-indigo-600 text-white font-semibold py-2.5 rounded-lg hover:bg-indigo-700 transition disabled:opacity-70">
            {isLoading ? "Registering..." : "Register as Company"}
          </button>
        </form>
      )}

      <p className="mt-8 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
