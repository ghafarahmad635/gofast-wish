import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin as adminPlugin, emailOTP } from "better-auth/plugins";
import { stripe } from "@better-auth/stripe";
import Stripe from "stripe";

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
        console.log("🟢 [Stripe] Customer created for:", user.email);

        try {
          // ✅ Store the Stripe Customer ID in your DB
          await db.user.update({
            where: { id: user.id },
            data: { stripeCustomerId: stripeCustomer.id },
          });

          console.log(
            `✅ [Stripe] Saved stripeCustomerId (${stripeCustomer.id}) for user ${user.email}`
          );

          // ✅ Optional welcome email
          await sendEmail({
            to: user.email,
            subject: "Welcome to GoFast Wish — Your Stripe Account is Ready",
            react: SubscriptionActivatedEmail({
              title: "Welcome to GoFast Wish",
              message:
                "Your account is now connected to our payment system. You can start your subscription or upgrade anytime.",
            }),
          });

          console.log(`📧 [Stripe] Welcome email sent to: ${user.email}`);
        } catch (err) {
          console.error("❌ [Stripe] Failed to save stripeCustomerId:", err);
        }
      },

      onEvent: async (event) => {
        console.log(`⚡ [Stripe] Webhook Event Received: ${event.type}`);

        if (event.type === "invoice.paid") {
          console.log("💰 [Stripe] Handling invoice.paid event...");
          const invoice = event.data.object as Stripe.Invoice;
          const customerId = invoice.customer as string;
          console.log("📦 [Stripe] Invoice data:", {
            id: invoice.id,
            customerId,
            amount: invoice.amount_paid,
          });

          try {
            const user = await db.user.findFirst({
              where: { stripeCustomerId: customerId },
            });

            if (!user) {
              console.warn("⚠️ [Stripe] No matching user found for invoice:", customerId);
              return;
            }

            console.log("👤 [Stripe] Found user:", user.email);

            await sendEmail({
              to: user.email,
              subject: "Payment Receipt — GoFast Wish",
              react: PaymentReceiptEmail({
                name: user.name ?? "Valued Customer",
                amount: (invoice.amount_paid ?? 0) / 100,
                date: new Date(invoice.created * 1000).toLocaleDateString(),
                invoiceUrl: invoice.hosted_invoice_url,
              }),
            });

            console.log("✅ [Stripe] Payment receipt email sent:", user.email);
          } catch (err) {
            console.error("❌ [Stripe] Error handling invoice.paid:", err);
          }
        }
      },

      subscription: {
        enabled: true,
        requireEmailVerification: false,

        plans: [
          {
            name: "basic",
            priceId: "price_1SKYqAD8qR70pjFErK5C207r",
            limits: { projects: 5, storage: 10, createGoal: 5 },
          },
          {
            name: "pro",
            priceId: "price_1SKYsZD8qR70pjFEYXwZOCm0",
            limits: { projects: 50, storage: 100, createGoal: 50 },
            freeTrial: {
              days: 7,
              onTrialStart: async (subscription) => {
                console.log("🚀 [Stripe] Trial started:", subscription.id);

                const user = await db.user.findFirst({
                  where: { id: subscription.referenceId },
                });

                if (user) {
                  console.log("👤 [Stripe] Sending trial start email to:", user.email);
                  try {
                    await sendEmail({
                      to: user.email,
                      subject: "Your Free Trial Has Started — GoFast Wish",
                      react: TrialStartedEmail({ name: user.name ?? "User" }),
                    });
                    console.log("✅ [Stripe] Trial start email sent:", user.email);
                  } catch (err) {
                    console.error("❌ [Stripe] Failed to send trial start email:", err);
                  }
                } else {
                  console.warn("⚠️ [Stripe] User not found for trial start:", subscription.referenceId);
                }
              },

              onTrialEnd: async ({ subscription }) => {
                
                console.log("⏳ [Stripe] Trial ended:", subscription.id);

                const user = await db.user.findFirst({
                  where: { id: subscription.referenceId },
                });

                if (user) {
                  console.log("👤 [Stripe] Sending trial end email to:", user.email);
                  try {
                    await sendEmail({
                      to: user.email,
                      subject: "Your Trial Has Ended — Upgrade Now",
                      react: TrialEndedEmail({ name: user.name ?? "User" }),
                    });
                    console.log("✅ [Stripe] Trial end email sent:", user.email);
                  } catch (err) {
                    console.error("❌ [Stripe] Failed to send trial end email:", err);
                  }
                } else {
                  console.warn("⚠️ [Stripe] User not found for trial end:", subscription.referenceId);
                }
              },
            },
          },
        ],

        onSubscriptionComplete: async ({ subscription, plan }) => {
          console.log("🎉 [Stripe] Subscription complete:", {
            id: subscription.id,
            plan: plan.name,
          });

          const user = await db.user.findFirst({
            where: { id: subscription.referenceId },
          });

          if (user) {
            console.log("👤 [Stripe] Sending subscription activation email to:", user.email);
            try {
              await sendEmail({
                to: user.email,
                subject: `Your ${plan.name} Plan is Active — GoFast Wish`,
                react: SubscriptionActivatedEmail({
                  title: "Subscription Activated",
                  message: `Your ${plan.name} plan is now active. Thank you for joining GoFast Wish.`,
                }),
              });
              console.log("✅ [Stripe] Subscription activation email sent:", user.email);
            } catch (err) {
              console.error("❌ [Stripe] Failed to send subscription activation email:", err);
            }
          } else {
            console.warn("⚠️ [Stripe] No user found for subscription:", subscription.referenceId);
          }
        },

        onSubscriptionCancel: async ({ subscription }) => {
          console.log("⚠️ [Stripe] Subscription canceled:", subscription.id);

          const user = await db.user.findFirst({
            where: { id: subscription.referenceId },
          });

          if (user) {
            console.log("👤 [Stripe] Sending cancellation email to:", user.email);
            try {
              await sendEmail({
                to: user.email,
                subject: "Subscription Canceled — GoFast Wish",
                react: SubscriptionCanceledEmail({
                  name: user.name ?? "User",
                  message: "We're sorry to see you go. You can reactivate anytime.",
                }),
              });
              console.log("✅ [Stripe] Cancellation email sent:", user.email);
            } catch (err) {
              console.error("❌ [Stripe] Failed to send cancellation email:", err);
            }
          } else {
            console.warn("⚠️ [Stripe] No user found for subscription cancel:", subscription.referenceId);
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
        console.log(`🔐 Sending ${type} OTP ${otp} to ${email}`);

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
});
