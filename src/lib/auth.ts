import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin as adminPlugin } from "better-auth/plugins";
import { db } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),

  emailAndPassword: {
    enabled: true,
  },

  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  user: {
    additionalFields: {
      role: { type: "string", required: false, defaultValue: "user", input: false },
      loginStatus: { type: "boolean", required: false, defaultValue: true },
      country: { type: "string", required: false },
      timezone: { type: "string", required: false, defaultValue: "UTC" },
    },
  },

  plugins: [
    adminPlugin({
      adminRoles: ["SUPERADMIN"],
      defaultRole: "USER",
      bannedUserMessage:
        "You have been banned from this application. Please contact support.",
      impersonationSessionDuration: 60 * 60 * 24, // 1 day
    }),
  ],
});
