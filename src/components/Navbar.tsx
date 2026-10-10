"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full bg-indigo-900 text-white z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="font-bold text-xl">
              PlacementPortal
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center space-x-4">
              {session ? (
                <>
                  <span className="text-sm">{session.user.name}</span>
                  <span className="px-2 py-1 text-xs rounded-full bg-indigo-700">
                    {session.user.role}
                  </span>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="bg-indigo-600 hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium">
                    Login
                  </Link>
                  <Link href="/register" className="bg-indigo-600 hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-indigo-200 hover:text-white hover:bg-indigo-700 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden bg-indigo-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col">
            {session ? (
              <>
                <div className="px-3 py-2 text-sm text-white">
                  {session.user.name} <span className="ml-2 px-2 py-1 text-xs rounded-full bg-indigo-700">{session.user.role}</span>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-left hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium text-white"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium text-white">
                  Login
                </Link>
                <Link href="/register" className="hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium text-white">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
