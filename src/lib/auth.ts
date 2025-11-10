import { betterAuth, createMiddleware } from "better-auth";
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



const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil", // ✅ keep latest
});

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
  
  emailVerification: {
        autoSignInAfterVerification: true,
        async afterEmailVerification(user, request) {
            // Your custom logic here, e.g., grant access to premium features

            console.log(`${user.email} has been successfully verified!`);
            await sendEmail({
            to: user.email,
            subject: "Welcome to GoFast Wish 🎉",
            react: WelcomeEmail({name:user.name}),
          });

        }
  },

  user: {
    
    additionalFields: {
      role: { type: "string", required: false, defaultValue: "user", input: false },
      loginStatus: { type: "boolean", required: false, defaultValue: true },
      country: { type: "string", required: false },
      timezone: { type: "string", required: false, defaultValue: "UTC" },
    },
  },

  // ✅ All Stripe functionality MUST be inside the stripe() plugin
  plugins: [
    adminPlugin({
      adminRoles: ["SUPERADMIN"],
      defaultRole: "USER",
      bannedUserMessage:
        "You have been banned from this application. Please contact support.",
      impersonationSessionDuration: 60 * 60 * 24, // 1 day
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
          })

          // await sendEmail({
          //   to: user.email,
          //   subject: "Welcome to GoFast Wish — Your Stripe Account is Ready",
          //   react: SubscriptionActivatedEmail({
          //     title: "Welcome to GoFast Wish",
          //     message:
          //       "Your account is now connected to our payment system. You can start your subscription or upgrade anytime.",
          //   }),
          // })
        } catch (err) {
          console.error("[Stripe:onCustomerCreate] Failed:", err)
        }
      },

      onEvent: async (event) => {
        if (event.type !== "invoice.paid") return

        try {
          const invoice = event.data.object as Stripe.Invoice
          const customerId = invoice.customer as string

          const user = await db.user.findFirst({
            where: { stripeCustomerId: customerId },
          })
          if (!user) return

          const subscriptionId =
            typeof (invoice as any).subscription === "string"
              ? (invoice as any).subscription
              : null

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
          })

          await sendEmail({
            to: user.email,
            subject: "Payment Receipt — GoFast Wish",
            react: PaymentReceiptEmail({
              name: user.name ?? "Valued Customer",
              amount: (invoice.amount_paid ?? 0) / 100,
              date: new Date(invoice.created * 1000).toLocaleDateString(),
              invoiceUrl: invoice.hosted_invoice_url,
            }),
          })
        } catch (err) {
          console.error("[Stripe:onEvent] invoice.paid handler failed:", err)
        }
      },

      subscription: {
        enabled: true,
        requireEmailVerification: false,

        plans: [
          {
            name: "standard",
            priceId: "price_1SKYqAD8qR70pjFErK5C207r",
            annualDiscountPriceId: "price_1SN4QaD8qR70pjFEL3eaU7HH",
            freeTrial:{
               days: PLAN_TRIAL_DAYS.standard,
               onTrialStart: async (subscription) => {
                try {
                  const user = await db.user.findFirst({
                    where: { id: subscription.referenceId },
                  })
                  if (!user) return
                  await sendEmail({
                    to: user.email,
                    subject: "Your Free Trial Has Started — GoFast Wish",
                    react: TrialStartedEmail({ name: user.name ?? "User" }),
                  })
                } catch (err) {
                  console.error("[Stripe:onTrialStart] Failed:", err)
                }
              },

              onTrialEnd: async ({ subscription }) => {
                try {
                  const user = await db.user.findFirst({
                    where: { id: subscription.referenceId },
                  })
                  if (!user) return
                  await sendEmail({
                    to: user.email,
                    subject: "Your Trial Has Ended — Upgrade Now",
                    react: TrialEndedEmail({ name: user.name ?? "User" }),
                  })
                } catch (err) {
                  console.error("[Stripe:onTrialEnd] Failed:", err)
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
            priceId: "price_1SKYsZD8qR70pjFEYXwZOCm0",
            annualDiscountPriceId: "price_1SN4PED8qR70pjFE91x8HAu9",
            freeTrial: {
              days: PLAN_TRIAL_DAYS.pro,
              onTrialStart: async (subscription) => {
                try {
                  const user = await db.user.findFirst({
                    where: { id: subscription.referenceId },
                  })
                  if (!user) return
                  await sendEmail({
                    to: user.email,
                    subject: "Your Free Trial Has Started — GoFast Wish",
                    react: TrialStartedEmail({ name: user.name ?? "User" }),
                  })
                } catch (err) {
                  console.error("[Stripe:onTrialStart] Failed:", err)
                }
              },

              onTrialEnd: async ({ subscription }) => {
                try {
                  const user = await db.user.findFirst({
                    where: { id: subscription.referenceId },
                  })
                  if (!user) return
                  await sendEmail({
                    to: user.email,
                    subject: "Your Trial Has Ended — Upgrade Now",
                    react: TrialEndedEmail({ name: user.name ?? "User" }),
                  })
                } catch (err) {
                  console.error("[Stripe:onTrialEnd] Failed:", err)
                }
              },
            },
          },
        ],

        onSubscriptionComplete: async ({ subscription, plan }) => {
          try {
            const user = await db.user.findFirst({
              where: { id: subscription.referenceId },
            })
            if (!user) return
            await sendEmail({
              to: user.email,
              subject: `Your ${plan.name} Plan is Active — GoFast Wish`,
              react: SubscriptionActivatedEmail({
                title: "Subscription Activated",
                message: `Your ${plan.name} plan is now active. Thank you for joining GoFast Wish.`,
              }),
            })
          } catch (err) {
            console.error("[Stripe:onSubscriptionComplete] Failed:", err)
          }
        },

        onSubscriptionCancel: async ({ subscription }) => {
          try {
            const user = await db.user.findFirst({
              where: { id: subscription.referenceId },
            })
            if (!user) return
            await sendEmail({
              to: user.email,
              subject: "Subscription Canceled — GoFast Wish",
              react: SubscriptionCanceledEmail({
                name: user.name ?? "User",
                message:
                  "We're sorry to see you go. You can reactivate anytime from your dashboard.",
              }),
            })
          } catch (err) {
            console.error("[Stripe:onSubscriptionCancel] Failed:", err)
          }
        },
      },
    }),
     // 🔹 Email OTP Verification Plugin
      emailOTP({
      overrideDefaultEmailVerification: true, // replaces link-based verification with OTP
      sendVerificationOnSignUp: true,         // ✅ auto-send OTP when user signs up
      otpLength: 6,
      expiresIn: 600, // 10 minutes
      allowedAttempts: 5,
      
      
      async sendVerificationOTP({ email, otp, type }) {
        // console.log(`🔐 Sending ${type} OTP ${otp} to ${email}`);

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
      
      
    })

  ],
  databaseHooks: {
    user: {
      create: {
        // runs once after Better Auth has inserted the user
        after: async (user, ctx) => {
          try {
            // short circuit if already seeded for some reason
            const existing = await db.user.findUnique({
              where: { id: user.id },
              select: { demoSeededAt: true, welcomeEmailSent: true, email: true, name: true },
            });
            if (existing?.demoSeededAt) return;

            await db.$transaction(async (tx) => {
              // default goals
              await tx.goal.createMany({
                data: [
                  {
                    title: "Welcome to GoFast Wish 🎉",
                    description: "This is your first goal. You can edit or delete it anytime.",
                    category: "Getting Started",
                    priority: 2,
                    isCompleted: false,
                    userId: user.id,
                  },
                  {
                    title: "Explore Your Dashboard",
                    description: "Familiarize yourself with your dashboard and start creating new wishes and habits.",
                    category: "Setup",
                    priority: 3,
                    isCompleted: false,
                    userId: user.id,
                  },
                  {
                    title: "Customize Your Profile",
                    description: "Add your name, country, and time zone to personalize your experience.",
                    category: "Profile",
                    priority: 3,
                    isCompleted: false,
                    userId: user.id,
                  },
                  {
                    title: "Start Your First Habit 🚀",
                    description: "Track your first habit to stay motivated and build progress over time.",
                    category: "Habits",
                    priority: 1,
                    isCompleted: false,
                    userId: user.id,
                  },
                ],
              });

              // default habits
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

              // mark seeded
              await tx.user.update({
                where: { id: user.id },
                data: { demoSeededAt: new Date() },
              });
            });

            // welcome email once
            if (!existing?.welcomeEmailSent) {
              await sendEmail({
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
    // keep your other hooks if needed, but remove the seeding from here
    after: createAuthMiddleware(async (ctx) => {
      // do nothing here for seeding to avoid firing on session renewal
      // you can still keep your sign up logging if you want
      if (ctx.path.startsWith("/sign-up")) {
        const newSession = ctx.context.newSession;
        if (newSession) {
          console.log("New user session created", newSession.user.id);
        }
      }
    }),
  },
});
