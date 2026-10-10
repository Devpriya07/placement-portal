import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      userId: string;
      role: string;
      studentId: string | null;
      companyId: string | null;
      approvalStatus: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    role: string;
    studentId: string | null;
    companyId: string | null;
    approvalStatus: string | null;
  }
}
