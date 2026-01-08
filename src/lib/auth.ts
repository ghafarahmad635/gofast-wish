import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin as adminPlugin, emailOTP } from "better-auth/plugins";
import { createAuthMiddleware } from "better-auth/api";
import { db } from "./prisma";
import { sendEmail } from "./email";
import { LoginOtpEmail } from "@/components/emails-templates/LoginOtpEmail";
import { ResetPasswordEmail } from "@/components/emails-templates/ResetPasswordEmail";
import { SignupOtpEmail } from "@/components/emails-templates/SignupOtpEmail";
import { WelcomeEmail } from "@/components/emails-templates/WelcomeEmail";

import { ChangeEmailConfirmationEmail } from "@/components/emails-templates/ChangeEmailConfirmationEmail";
import { ac, superadmin } from "./permissions";

import { decodeJwtPayload } from "./utils";
import { ChangeEmailVerificationEmail } from "@/components/emails-templates/ChangeEmailVerificationEmail";
import { AccountEmailVerificationEmail } from "@/components/emails-templates/AccountEmailVerificationEmail";
import { stripePlugin } from "./stripe-plugin";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL, 
  database: prismaAdapter(db, { provider: "postgresql" }),

  emailAndPassword: { enabled: true },

  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  // IMPORTANT: required for changeEmail flow
 
  user: {
     deleteUser: {
      enabled: true,
    },
    changeEmail: {
      enabled: true,

      // optional but recommended: confirm from CURRENT email first
      async sendChangeEmailConfirmation({ user, newEmail, url }) {
        void sendEmail({
          to: user.email,
          subject: "Approve email change",
          text: `Approve changing your email to ${newEmail}: ${url}`,
          react: ChangeEmailConfirmationEmail({
            name: user.name ?? "Valued Customer",
            currentEmail: user.email,
            newEmail,
            approveUrl: url,
          }),
        });
      },
      
      
    },

    additionalFields: {
      
      loginStatus: { type: "boolean", required: false, defaultValue: true },
      country: { type: "string", required: false },
      timezone: { type: "string", required: false, defaultValue: "UTC" },
    },
  },
   emailVerification: {
     
    autoSignInAfterVerification: true,
     
     async sendVerificationEmail({ user, url, token }, request) {
    const payload = token ? decodeJwtPayload(token) : null;
    const requestType = payload?.requestType;

    // Better Auth change email tokens commonly include updateTo
    const newEmail = payload?.updateTo as string | undefined;

    // Detect change email verification
    const isChangeEmail =
      requestType?.includes("change-email") ||
      (newEmail && newEmail !== user.email);

    if (isChangeEmail && newEmail) {
      // Send "Verify new email" copy to the NEW email address
      void sendEmail({
        to: newEmail,
        subject: "Verify your new email — GoFast Wish",
        text: `Verify your new email: ${url}`,
        react: ChangeEmailVerificationEmail({
          name: user.name,
          newEmail,
          verifyUrl: url,
        }),
      });
      return;
    }

    // Default: normal account verification (signup / unverified user)
    void sendEmail({
      to: user.email,
      subject: "Verify your email — GoFast Wish",
      text: `Verify your email: ${url}`,
      react: AccountEmailVerificationEmail({
        name: user.name,
        verifyUrl: url,
      }),
    });
  },

    async afterEmailVerification(user,request) {
      console.log(request)
      console.log(`${user.email} has been successfully verified!`);

      void sendEmail({
        to: user.email,
        subject: "Welcome to GoFast Wish 🎉",
        react: WelcomeEmail({ name: user.name ?? "Friend" }),
      });
    },
    
  },


  plugins: [
      adminPlugin({
     ac,
   roles: {superadmin},
  defaultRole: "user",
  
  bannedUserMessage:
    "You have been banned from this application. Please contact support.",
  impersonationSessionDuration: 60 * 60 * 24,
  }),

    stripePlugin,

  
    emailOTP({
      overrideDefaultEmailVerification: true,
      sendVerificationOnSignUp: true,
      otpLength: 6,
      expiresIn: 600,
      allowedAttempts: 5,

      async sendVerificationOTP({ email, otp, type }) {
        let subject = "Your GoFast Wish verification code";
        if (type === "sign-in") subject = "Your GoFast Wish sign-in code";
        if (type === "forget-password") subject = "Reset your GoFast Wish password";
        if (type === "email-verification") subject = "Verify your GoFast Wish account";

        await sendEmail({
          to: email,
          subject,
          react:
            type === "sign-in"
              ? LoginOtpEmail({ otp })
              : type === "forget-password"
              ? ResetPasswordEmail({ otp })
              : SignupOtpEmail({ otp }),
        });
      },
    }),
  ],

  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            const existing = await db.user.findUnique({
              where: { id: user.id },
              select: {
                demoSeededAt: true,
                welcomeEmailSent: true,
                email: true,
                name: true,
              },
            });
            if (existing?.demoSeededAt) return;

            await db.$transaction(async (tx) => {
              const [imgWelcome, imgDashboard, imgProfile, imgHabit] = await Promise.all([
                tx.media.upsert({
                  where: { key: "goal_welcome" },
                  update: { url: "/default-goals/goal-welcome.webp", isSystem: true },
                  create: {
                    key: "goal_welcome",
                    url: "/default-goals/goal-welcome.webp",
                    fileName: "goal-welcome.webp",
                    fileType: "image",
                    fileSize: 0,
                    mimeType: "image/webp",
                    extension: "webp",
                    uploadedBy: null,
                    isSystem: true,
                  },
                }),
                tx.media.upsert({
                  where: { key: "goal_dashboard" },
                  update: { url: "/default-goals/goal-dashboard.webp", isSystem: true },
                  create: {
                    key: "goal_dashboard",
                    url: "/default-goals/goal-dashboard.webp",
                    fileName: "goal-dashboard.webp",
                    fileType: "image",
                    fileSize: 0,
                    mimeType: "image/webp",
                    extension: "webp",
                    uploadedBy: null,
                    isSystem: true,
                  },
                }),
                tx.media.upsert({
                  where: { key: "goal_profile" },
                  update: { url: "/default-goals/goal-profile.webp", isSystem: true },
                  create: {
                    key: "goal_profile",
                    url: "/default-goals/goal-profile.webp",
                    fileName: "goal-profile.webp",
                    fileType: "image",
                    fileSize: 0,
                    mimeType: "image/webp",
                    extension: "webp",
                    uploadedBy: null,
                    isSystem: true,
                  },
                }),
                tx.media.upsert({
                  where: { key: "goal_habit" },
                  update: { url: "/default-goals/goal-habit.webp", isSystem: true },
                  create: {
                    key: "goal_habit",
                    url: "/default-goals/goal-habit.webp",
                    fileName: "goal-habit.webp",
                    fileType: "image",
                    fileSize: 0,
                    mimeType: "image/webp",
                    extension: "webp",
                    uploadedBy: null,
                    isSystem: true,
                  },
                }),
              ]);
              
              await tx.goal.createMany({
                data: [
                  {
                    title: "Welcome to GoFast Wish 🎉",
                    description: "This is your first goal. You can edit or delete it anytime.",
                    priority: 2,
                    isCompleted: false,
                    userId: user.id,
                     featuredImageId: imgWelcome.id,
                  },
                  {
                    title: "Explore Your Dashboard",
                    description:
                      "Familiarize yourself with your dashboard and start creating new wishes and habits.",
                    priority: 3,
                    isCompleted: false,
                    userId: user.id,
                    featuredImageId: imgDashboard.id,
                  },
                  {
                    title: "Customize Your Profile",
                    description: "Add your name, country, and time zone to personalize your experience.",
                    priority: 3,
                    isCompleted: false,
                    userId: user.id,
                     featuredImageId: imgProfile.id,
                  },
                  {
                    title: "Start Your First Habit 🚀",
                    description: "Track your first habit to stay motivated and build progress over time.",
                    priority: 1,
                    isCompleted: false,
                    userId: user.id,
                     featuredImageId: imgHabit.id,
                  },
                ],
              });

              const now = new Date();
              await tx.habit.createMany({
                data: [
                  {
                    title: "Drink Water 💧",
                    description: "Stay hydrated with 8 glasses of water today.",
                    frequency: "daily",
                    startDate: now,
                    userId: user.id,
                  },
                  {
                    title: "Take a Short Walk 🚶‍♂️",
                    description: "Go outside for a 10 minute walk.",
                    frequency: "daily",
                    startDate: now,
                    userId: user.id,
                  },
                  {
                    title: "Reflect on Your Day ✍️",
                    description: "Write one line about what went well today.",
                    frequency: "daily",
                    startDate: now,
                    userId: user.id,
                  },
                  {
                    title: "Plan Tomorrow’s Tasks 🗓️",
                    description: "List your top 3 goals for tomorrow.",
                    frequency: "daily",
                    startDate: now,
                    userId: user.id,
                  },
                ],
              });

              await tx.user.update({
                where: { id: user.id },
                data: { demoSeededAt: new Date() },
              });
            });

            if (!existing?.welcomeEmailSent) {
              void sendEmail({
                to: user.email,
                subject: "Welcome to GoFast Wish 🎉",
                react: WelcomeEmail({ name: user.name ?? "Friend" }),
              });

              await db.user.update({
                where: { id: user.id },
                data: { welcomeEmailSent: true },
              });
            }
          } catch (err) {
            console.error("[DB Hook user.create.after] seeding failed:", err);
          }
        },
      },
    },
  },

  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path.startsWith("/sign-up")) {
        const newSession = ctx.context.newSession;
        if (newSession) console.log("New user session created", newSession.user.id);
      }
    }),
  },
});
