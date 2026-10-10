"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function requireStudent() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "STUDENT") {
    throw new Error("Unauthorized: Student access required");
  }
  if (!session.user.studentId) {
    throw new Error("Student profile not found");
  }
  return session;
}

export async function getStudentProfile() {
  const session = await requireStudent();
  return prisma.student.findUnique({
    where: { id: session.user.studentId! },
    include: { user: { select: { email: true, username: true } } },
  });
}

export async function updateStudentProfile(formData: FormData) {
  const session = await requireStudent();

  await prisma.student.update({
    where: { id: session.user.studentId! },
    data: {
      fullName: formData.get("fullName") as string,
      phone: (formData.get("phone") as string) || "",
      department: (formData.get("department") as string) || "",
      cgpa: parseFloat((formData.get("cgpa") as string) || "0"),
      skills: (formData.get("skills") as string) || "",
      resumeFilename: (formData.get("resumeFilename") as string) || undefined,
    },
  });

  revalidatePath("/student/profile");
  return { success: true };
}

export async function getStudentStats() {
  const session = await requireStudent();
  const studentId = session.user.studentId!;

  const [totalApplications, shortlisted, placed] = await Promise.all([
    prisma.application.count({ where: { studentId } }),
    prisma.application.count({
      where: { studentId, status: { in: ["SHORTLISTED", "INTERVIEW"] } },
    }),
    prisma.application.count({
      where: { studentId, status: "PLACED" },
    }),
  ]);

  return { totalApplications, shortlisted, placed };
}

export async function getOpenDrives(search?: string) {
  const session = await requireStudent();

  const where: any = {
    status: "OPEN",
    deadline: { gte: new Date() },
    company: { approvalStatus: "APPROVED", isBlacklisted: false },
  };

  if (search) {
    where.OR = [
      { jobTitle: { contains: search } },
      { requiredSkills: { contains: search } },
      { company: { companyName: { contains: search } } },
    ];
  }

  return prisma.placementDrive.findMany({
    where,
    include: {
      company: { select: { companyName: true, industry: true } },
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function applyToDrive(driveId: string) {
  const session = await requireStudent();
  const studentId = session.user.studentId!;

  // Check if student is blacklisted
  const student = await prisma.student.findUnique({
    where: { id: studentId },
  });
  if (student?.isBlacklisted) {
    return { error: "You have been blacklisted and cannot apply" };
  }

  // Check if already applied
  const existing = await prisma.application.findUnique({
    where: { studentId_driveId: { studentId, driveId } },
  });
  if (existing) {
    return { error: "You have already applied to this drive" };
  }

  // Check if drive is open
  const drive = await prisma.placementDrive.findUnique({
    where: { id: driveId },
  });
  if (!drive || drive.status !== "OPEN" || drive.deadline < new Date()) {
    return { error: "This drive is no longer accepting applications" };
  }

  await prisma.application.create({
    data: { studentId, driveId },
  });

  revalidatePath("/student/drives");
  revalidatePath("/student/applications");
  return { success: true };
}

export async function withdrawApplication(applicationId: string) {
  const session = await requireStudent();

  const application = await prisma.application.findFirst({
    where: {
      id: applicationId,
      studentId: session.user.studentId!,
      status: "APPLIED",
    },
  });

  if (!application) {
    return { error: "Application not found or cannot be withdrawn" };
  }

  await prisma.application.delete({ where: { id: applicationId } });

  revalidatePath("/student/applications");
  return { success: true };
}

export async function getApplicationHistory() {
  const session = await requireStudent();
  return prisma.application.findMany({
    where: { studentId: session.user.studentId! },
    include: {
      drive: {
        include: { company: { select: { companyName: true } } },
      },
    },
    orderBy: { appliedAt: "desc" },
  });
}

export async function getStudentApplicationForDrive(driveId: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "STUDENT" || !session.user.studentId) {
    return null;
  }
  return prisma.application.findUnique({
    where: {
      studentId_driveId: {
        studentId: session.user.studentId,
        driveId,
      },
    },
  });
}
