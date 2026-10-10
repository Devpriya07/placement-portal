"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  role: "ADMIN" | "COMPANY" | "STUDENT";
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const navItems = {
    ADMIN: [
      { name: "Dashboard", href: "/admin", icon: "📊" },
      { name: "Companies", href: "/admin/companies", icon: "🏢" },
      { name: "Users", href: "/admin/users", icon: "👥" },
      { name: "Applications", href: "/admin/applications", icon: "📄" },
    ],
    COMPANY: [
      { name: "Dashboard", href: "/company", icon: "📊" },
      { name: "My Drives", href: "/company/drives", icon: "🚀" },
      { name: "New Drive", href: "/company/drives/new", icon: "➕" },
      { name: "Profile", href: "/company/profile", icon: "🏢" },
    ],
    STUDENT: [
      { name: "Dashboard", href: "/student", icon: "📊" },
      { name: "Browse Drives", href: "/student/drives", icon: "🔍" },
      { name: "My Applications", href: "/student/applications", icon: "📄" },
      { name: "Profile", href: "/student/profile", icon: "👤" },
    ],
  };

  const items = navItems[role] || [];

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white border-r pt-16 z-40 hidden md:flex md:flex-col">
      <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {items.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/admin" && item.href !== "/company" && item.href !== "/student");
          
          // Special handling for exact dashboard matching
          const isExactActive = pathname === item.href;
          const finalActive = (item.href === `/${role.toLowerCase()}`) ? isExactActive : isActive;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                finalActive
                  ? "bg-indigo-50 text-indigo-700 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
