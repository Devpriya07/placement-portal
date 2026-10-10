import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { student: true, company: true },
        });

        if (!user) {
          throw new Error("Invalid email or password");
        }

        if (!user.isActive) {
          throw new Error("Your account has been deactivated");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        // Check if company is blacklisted
        if (user.role === "COMPANY" && user.company?.isBlacklisted) {
          throw new Error("Your company has been blacklisted");
        }

        // Check if student is blacklisted
        if (user.role === "STUDENT" && user.student?.isBlacklisted) {
          throw new Error("Your account has been blacklisted");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.username,
          role: user.role,
          studentId: user.student?.id || null,
          companyId: user.company?.id || null,
          approvalStatus: user.company?.approvalStatus || null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.userId = user.id;
        token.studentId = (user as any).studentId;
        token.companyId = (user as any).companyId;
        token.approvalStatus = (user as any).approvalStatus;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).userId = token.userId;
        (session.user as any).studentId = token.studentId;
        (session.user as any).companyId = token.companyId;
        (session.user as any).approvalStatus = token.approvalStatus;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
