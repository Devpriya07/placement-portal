"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required");
  }
  return session;
}

export async function getAdminStats() {
  await requireAdmin();

  const [
    totalStudents,
    totalCompanies,
    totalDrives,
    totalApplications,
    totalPlacements,
    pendingCompanies,
  ] = await Promise.all([
    prisma.student.count(),
    prisma.company.count(),
    prisma.placementDrive.count(),
    prisma.application.count(),
    prisma.application.count({ where: { status: "PLACED" } }),
    prisma.company.count({ where: { approvalStatus: "PENDING" } }),
  ]);

  return {
    totalStudents,
    totalCompanies,
    totalDrives,
    totalApplications,
    totalPlacements,
    pendingCompanies,
  };
}

export async function getAnalyticsData() {
  await requireAdmin();

  // Applications by status
  const applications = await prisma.application.findMany({
    select: { status: true },
  });

  const statusCounts: Record<string, number> = {};
  applications.forEach((app) => {
    statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
  });

  // Drives by month (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const drives = await prisma.placementDrive.findMany({
    where: { createdAt: { gte: sixMonthsAgo } },
    select: { createdAt: true },
  });

  const monthlyDrives: Record<string, number> = {};
  drives.forEach((drive) => {
    const month = drive.createdAt.toLocaleString("en-US", {
      month: "short",
      year: "numeric",
    });
    monthlyDrives[month] = (monthlyDrives[month] || 0) + 1;
  });

  // Top departments
  const students = await prisma.student.findMany({
    select: { department: true },
  });

  const deptCounts: Record<string, number> = {};
  students.forEach((s) => {
    if (s.department) {
      deptCounts[s.department] = (deptCounts[s.department] || 0) + 1;
    }
  });

  return { statusCounts, monthlyDrives, deptCounts };
}

export async function getPendingCompanies() {
  await requireAdmin();
  return prisma.company.findMany({
    where: { approvalStatus: "PENDING" },
    include: { user: { select: { email: true, username: true, createdAt: true } } },
    orderBy: { user: { createdAt: "desc" } },
  });
}

export async function getAllCompanies() {
  await requireAdmin();
  return prisma.company.findMany({
    include: { user: { select: { email: true, username: true, createdAt: true, isActive: true } } },
    orderBy: { user: { createdAt: "desc" } },
  });
}

export async function approveCompany(companyId: string) {
  await requireAdmin();
  await prisma.company.update({
    where: { id: companyId },
    data: { approvalStatus: "APPROVED" },
  });
  revalidatePath("/admin/companies");
  revalidatePath("/admin");
}

export async function rejectCompany(companyId: string) {
  await requireAdmin();
  await prisma.company.update({
    where: { id: companyId },
    data: { approvalStatus: "REJECTED" },
  });
  revalidatePath("/admin/companies");
  revalidatePath("/admin");
}

export async function getAllUsers() {
  await requireAdmin();

  const students = await prisma.student.findMany({
    include: { user: { select: { id: true, username: true, email: true, isActive: true, createdAt: true, role: true } } },
  });

  const companies = await prisma.company.findMany({
    include: { user: { select: { id: true, username: true, email: true, isActive: true, createdAt: true, role: true } } },
  });

  return { students, companies };
}

export async function blacklistStudent(studentId: string) {
  await requireAdmin();
  await prisma.student.update({
    where: { id: studentId },
    data: { isBlacklisted: true },
  });
  revalidatePath("/admin/users");
}

export async function unblacklistStudent(studentId: string) {
  await requireAdmin();
  await prisma.student.update({
    where: { id: studentId },
    data: { isBlacklisted: false },
  });
  revalidatePath("/admin/users");
}

export async function blacklistCompany(companyId: string) {
  await requireAdmin();
  await prisma.company.update({
    where: { id: companyId },
    data: { isBlacklisted: true },
  });
  revalidatePath("/admin/companies");
  revalidatePath("/admin/users");
}

export async function unblacklistCompany(companyId: string) {
  await requireAdmin();
  await prisma.company.update({
    where: { id: companyId },
    data: { isBlacklisted: false },
  });
  revalidatePath("/admin/companies");
  revalidatePath("/admin/users");
}

export async function toggleUserActive(userId: string) {
  await requireAdmin();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: !user.isActive },
  });
  revalidatePath("/admin/users");
}

export async function getAllApplications() {
  await requireAdmin();
  return prisma.application.findMany({
    include: {
      student: { include: { user: { select: { email: true } } } },
      drive: { include: { company: { select: { companyName: true } } } },
    },
    orderBy: { appliedAt: "desc" },
  });
}
