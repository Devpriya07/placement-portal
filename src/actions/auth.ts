"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function registerStudent(formData: FormData) {
  const username = formData.get("username") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;

  if (!username || !email || !password || !fullName) {
    return { error: "All fields are required" };
  }

  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });

  if (existingUser) {
    return { error: "Email or username already exists" };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      role: "STUDENT",
      student: {
        create: {
          fullName,
        },
      },
    },
  });

  return { success: true };
}

export async function registerCompany(formData: FormData) {
  const username = formData.get("username") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const companyName = formData.get("companyName") as string;
  const industry = formData.get("industry") as string;
  const hrContact = formData.get("hrContact") as string;
  const website = formData.get("website") as string;

  if (!username || !email || !password || !companyName) {
    return { error: "Username, email, password, and company name are required" };
  }

  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });

  if (existingUser) {
    return { error: "Email or username already exists" };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      role: "COMPANY",
      company: {
        create: {
          companyName,
          industry: industry || "",
          hrContact: hrContact || "",
          website: website || "",
          approvalStatus: "PENDING",
        },
      },
    },
  });

  return { success: true };
}
