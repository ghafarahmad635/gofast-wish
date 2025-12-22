import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin as adminPlugin, emailOTP } from "better-auth/plugins";
import { stripe } from "@better-auth/stripe";
import Stripe from "stripe";
import { createAuthMiddleware } from "better-auth/api";

import { db } from "./prisma";
import { sendEmail } from "./email";

import { LoginOtpEmail } from "@/components/emails-templates/LoginOtpEmail";
import { ResetPasswordEmail } from "@/components/emails-templates/ResetPasswordEmail";
import { SignupOtpEmail } from "@/components/emails-templates/SignupOtpEmail";
import { WelcomeEmail } from "@/components/emails-templates/WelcomeEmail";
import { SubscriptionActivatedEmail } from "@/components/emails-templates/subscription/SubscriptionActivatedEmail";
import { PaymentReceiptEmail } from "@/components/emails-templates/subscription/PaymentReceiptEmail";
import { TrialStartedEmail } from "@/components/emails-templates/subscription/TrialStartedEmail";
import { TrialEndedEmail } from "@/components/emails-templates/subscription/TrialEndedEmail";
import { SubscriptionCanceledEmail } from "@/components/emails-templates/subscription/SubscriptionCanceledEmail";
import { PLAN_LIMITS, PLAN_TRIAL_DAYS } from "@/modules/upgrade/planConfig";
import { ChangeEmailConfirmationEmail } from "@/components/emails-templates/ChangeEmailConfirmationEmail";
import { ac, superadmin } from "./permissions";

import { decodeJwtPayload } from "./utils";
import { ChangeEmailVerificationEmail } from "@/components/emails-templates/ChangeEmailVerificationEmail";
import { AccountEmailVerificationEmail } from "@/components/emails-templates/AccountEmailVerificationEmail";
import { STRIPE_CONFIG } from "@/config/billing";


const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

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

    stripe({
      stripeClient,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      createCustomerOnSignUp: true,

      onCustomerCreate: async ({ stripeCustomer, user }) => {
        try {
          await db.user.update({
            where: { id: user.id },
            data: { stripeCustomerId: stripeCustomer.id },
          });
        } catch (err) {
          console.error("[Stripe:onCustomerCreate] Failed:", err);
        }
      },

      onEvent: async (event) => {
        if (event.type !== "invoice.paid") return;

        try {
          const invoice = event.data.object as Stripe.Invoice;
          const customerId = invoice.customer as string;

          const user = await db.user.findFirst({
            where: { stripeCustomerId: customerId },
          });
          if (!user) return;

          let subscriptionId: string | null = null;

          const parent: any = (invoice as any).parent;
          if (parent?.type === "subscription_details") {
            subscriptionId = parent.subscription_details?.subscription ?? null;
          }

          if (!subscriptionId) {
            for (const line of invoice.lines.data as any[]) {
              const subFromLine =
                line?.parent?.subscription_item_details?.subscription;
              if (subFromLine) {
                subscriptionId = subFromLine;
                break;
              }
            }
          }

          if (!subscriptionId) {
            console.warn(
              "[Stripe:onEvent] invoice.paid: no subscription id found on invoice",
              invoice.id,
            );
          }

          await db.order.create({
            data: {
              userId: user.id,
              stripeInvoiceId: invoice.id,
              stripeSubscriptionId: subscriptionId,
              stripeCustomerId: customerId,
              amount: (invoice.amount_paid ?? 0) / 100,
              currency: invoice.currency || "usd",
              status: invoice.status ?? "paid",
              hostedInvoiceUrl: invoice.hosted_invoice_url || null,
              invoicePdfUrl: invoice.invoice_pdf || null,
              customerEmail: invoice.customer_email || user.email,
              customerName: invoice.customer_name || user.name,
            },
          });

          void sendEmail({
            to: user.email,
            subject: "Payment Receipt — GoFast Wish",
            react: PaymentReceiptEmail({
              name: user.name ?? "Valued Customer",
              amount: (invoice.amount_paid ?? 0) / 100,
              date: new Date(invoice.created * 1000).toLocaleDateString(),
              invoiceUrl: invoice.hosted_invoice_url,
            }),
          });
        } catch (err) {
          console.error("[Stripe:onEvent] invoice.paid handler failed:", err);
        }
      },

      subscription: {
        enabled: true,
        requireEmailVerification: false,

        plans: [
        {
          name: "standard",
          priceId: STRIPE_CONFIG.plans.standard.monthly,
          annualDiscountPriceId: STRIPE_CONFIG.plans.standard.annual,
          freeTrial: {
            days: PLAN_TRIAL_DAYS.standard,
            onTrialStart: async (subscription) => {
              try {
                const user = await db.user.findFirst({
                  where: { id: subscription.referenceId },
                });
                if (!user) return;

                void sendEmail({
                  to: user.email,
                  subject: "Your Free Trial Has Started — GoFast Wish",
                  react: TrialStartedEmail({ name: user.name ?? "User" }),
                });
              } catch (err) {
                console.error("[Stripe:onTrialStart] Failed:", err);
              }
            },
            onTrialEnd: async ({ subscription }) => {
              try {
                const user = await db.user.findFirst({
                  where: { id: subscription.referenceId },
                });
                if (!user) return;

                void sendEmail({
                  to: user.email,
                  subject: "Your Trial Has Ended — Upgrade Now",
                  react: TrialEndedEmail({ name: user.name ?? "User" }),
                });
              } catch (err) {
                console.error("[Stripe:onTrialEnd] Failed:", err);
              }
            },
          },
          limits: {
            createWishes: PLAN_LIMITS.standard.wishes,
            createHabits: PLAN_LIMITS.standard.habits,
          },
        },
        {
          name: "pro",
          priceId: STRIPE_CONFIG.plans.pro.monthly,
          annualDiscountPriceId: STRIPE_CONFIG.plans.pro.annual,
          freeTrial: {
            days: PLAN_TRIAL_DAYS.pro,
            onTrialStart: async (subscription) => {
              try {
                const user = await db.user.findFirst({
                  where: { id: subscription.referenceId },
                });
                if (!user) return;

                void sendEmail({
                  to: user.email,
                  subject: "Your Free Trial Has Started — GoFast Wish",
                  react: TrialStartedEmail({ name: user.name ?? "User" }),
                });
              } catch (err) {
                console.error("[Stripe:onTrialStart] Failed:", err);
              }
            },
            onTrialEnd: async ({ subscription }) => {
              try {
                const user = await db.user.findFirst({
                  where: { id: subscription.referenceId },
                });
                if (!user) return;

                void sendEmail({
                  to: user.email,
                  subject: "Your Trial Has Ended — Upgrade Now",
                  react: TrialEndedEmail({ name: user.name ?? "User" }),
                });
              } catch (err) {
                console.error("[Stripe:onTrialEnd] Failed:", err);
              }
            },
          },
        },
      ],

        onSubscriptionComplete: async ({ subscription, plan }) => {
          try {
            const user = await db.user.findFirst({
              where: { id: subscription.referenceId },
            });
            if (!user) return;

            void sendEmail({
              to: user.email,
              subject: `Your ${plan.name} Plan is Active — GoFast Wish`,
              react: SubscriptionActivatedEmail({
                title: "Subscription Activated",
                message: `Your ${plan.name} plan is now active. Thank you for joining GoFast Wish.`,
              }),
            });
          } catch (err) {
            console.error("[Stripe:onSubscriptionComplete] Failed:", err);
          }
        },

        onSubscriptionCancel: async ({ subscription }) => {
          try {
            const user = await db.user.findFirst({
              where: { id: subscription.referenceId },
            });
            if (!user) return;

            void sendEmail({
              to: user.email,
              subject: "Subscription Canceled — GoFast Wish",
              react: SubscriptionCanceledEmail({
                name: user.name ?? "User",
                message:
                  "We're sorry to see you go. You can reactivate anytime from your dashboard.",
              }),
            });
          } catch (err) {
            console.error("[Stripe:onSubscriptionCancel] Failed:", err);
          }
        },
      },
    }),

    // IMPORTANT: do not override default email verification
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
              await tx.goal.createMany({
                data: [
                  {
                    title: "Welcome to GoFast Wish 🎉",
                    description: "This is your first goal. You can edit or delete it anytime.",
                    priority: 2,
                    isCompleted: false,
                    userId: user.id,
                  },
                  {
                    title: "Explore Your Dashboard",
                    description:
                      "Familiarize yourself with your dashboard and start creating new wishes and habits.",
                    priority: 3,
                    isCompleted: false,
                    userId: user.id,
                  },
                  {
                    title: "Customize Your Profile",
                    description: "Add your name, country, and time zone to personalize your experience.",
                    priority: 3,
                    isCompleted: false,
                    userId: user.id,
                  },
                  {
                    title: "Start Your First Habit 🚀",
                    description: "Track your first habit to stay motivated and build progress over time.",
                    priority: 1,
                    isCompleted: false,
                    userId: user.id,
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
