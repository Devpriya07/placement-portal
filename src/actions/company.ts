"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function requireCompany() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "COMPANY") {
    throw new Error("Unauthorized: Company access required");
  }
  if (!session.user.companyId) {
    throw new Error("Company profile not found");
  }
  return session;
}

export async function getCompanyProfile() {
  const session = await requireCompany();
  return prisma.company.findUnique({
    where: { id: session.user.companyId! },
    include: { user: { select: { email: true, username: true } } },
  });
}

export async function updateCompanyProfile(formData: FormData) {
  const session = await requireCompany();
  const companyName = formData.get("companyName") as string;
  const industry = formData.get("industry") as string;
  const hrContact = formData.get("hrContact") as string;
  const website = formData.get("website") as string;

  await prisma.company.update({
    where: { id: session.user.companyId! },
    data: {
      companyName: companyName || undefined,
      industry: industry || "",
      hrContact: hrContact || "",
      website: website || "",
    },
  });

  revalidatePath("/company/profile");
  return { success: true };
}

export async function getCompanyDrives() {
  const session = await requireCompany();
  return prisma.placementDrive.findMany({
    where: { companyId: session.user.companyId! },
    include: { _count: { select: { applications: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCompanyStats() {
  const session = await requireCompany();
  const companyId = session.user.companyId!;

  const [totalDrives, openDrives, totalApplications, placements] =
    await Promise.all([
      prisma.placementDrive.count({ where: { companyId } }),
      prisma.placementDrive.count({ where: { companyId, status: "OPEN" } }),
      prisma.application.count({
        where: { drive: { companyId } },
      }),
      prisma.application.count({
        where: { drive: { companyId }, status: "PLACED" },
      }),
    ]);

  return { totalDrives, openDrives, totalApplications, placements };
}

export async function createDrive(formData: FormData) {
  const session = await requireCompany();

  const data = {
    companyId: session.user.companyId!,
    jobTitle: formData.get("jobTitle") as string,
    jobDescription: formData.get("jobDescription") as string,
    eligibilityCriteria: formData.get("eligibilityCriteria") as string,
    requiredSkills: formData.get("requiredSkills") as string,
    experienceRequired: formData.get("experienceRequired") as string,
    salaryRange: formData.get("salaryRange") as string,
    deadline: new Date(formData.get("deadline") as string),
    status: "OPEN",
  };

  if (!data.jobTitle || !data.deadline) {
    return { error: "Job title and deadline are required" };
  }

  await prisma.placementDrive.create({ data });
  revalidatePath("/company/drives");
  return { success: true };
}

export async function getDriveById(driveId: string) {
  const session = await requireCompany();
  return prisma.placementDrive.findFirst({
    where: { id: driveId, companyId: session.user.companyId! },
    include: {
      applications: {
        include: {
          student: {
            include: { user: { select: { email: true } } },
          },
        },
        orderBy: { appliedAt: "desc" },
      },
    },
  });
}

export async function updateDrive(driveId: string, formData: FormData) {
  const session = await requireCompany();

  const drive = await prisma.placementDrive.findFirst({
    where: { id: driveId, companyId: session.user.companyId! },
  });

  if (!drive) return { error: "Drive not found" };

  await prisma.placementDrive.update({
    where: { id: driveId },
    data: {
      jobTitle: formData.get("jobTitle") as string,
      jobDescription: formData.get("jobDescription") as string,
      eligibilityCriteria: formData.get("eligibilityCriteria") as string,
      requiredSkills: formData.get("requiredSkills") as string,
      experienceRequired: formData.get("experienceRequired") as string,
      salaryRange: formData.get("salaryRange") as string,
      deadline: new Date(formData.get("deadline") as string),
    },
  });

  revalidatePath(`/company/drives/${driveId}`);
  revalidatePath("/company/drives");
  return { success: true };
}

export async function closeDrive(driveId: string) {
  const session = await requireCompany();
  await prisma.placementDrive.updateMany({
    where: { id: driveId, companyId: session.user.companyId! },
    data: { status: "CLOSED" },
  });
  revalidatePath("/company/drives");
  revalidatePath(`/company/drives/${driveId}`);
}

export async function deleteDrive(driveId: string) {
  const session = await requireCompany();
  await prisma.placementDrive.deleteMany({
    where: { id: driveId, companyId: session.user.companyId! },
  });
  revalidatePath("/company/drives");
}

export async function updateApplicationStatus(
  applicationId: string,
  status: string
) {
  const session = await requireCompany();

  const application = await prisma.application.findFirst({
    where: {
      id: applicationId,
      drive: { companyId: session.user.companyId! },
    },
  });

  if (!application) throw new Error("Application not found");

  await prisma.application.update({
    where: { id: applicationId },
    data: { status },
  });

  revalidatePath(`/company/drives/${application.driveId}`);
}
