import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin as adminPlugin } from "better-auth/plugins";
import { stripe } from "@better-auth/stripe";
import Stripe from "stripe";

import { db } from "./prisma";

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
        console.log(`✅ Stripe customer ${stripeCustomer.id} created for user ${user.email}`);
      },

      onEvent: async (event) => {
        console.log(`⚡ Stripe event: ${event.type}`);

        if (event.type === "invoice.paid") {
    const invoice = event.data.object as Stripe.Invoice;

        try {
          const customerId = invoice.customer as string;

          const user = await db.user.findFirst({
            where: { stripeCustomerId: customerId },
          });

          if (!user) {
            console.warn("⚠️ No matching user found for invoice.");
            return;
          }

          // Safely get subscription ID
          const subscriptionId =
            typeof (invoice as any).subscription === "string"
              ? (invoice as any).subscription
              : null;

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

          console.log(`💰 Order saved: ${invoice.id} for ${user.email}`);
        } catch (err) {
          console.error("❌ Failed to record order:", err);
        }
      }
      },


      // ✅ move the subscription config INSIDE the stripe plugin
      subscription: {
        enabled: true,
        requireEmailVerification: false,

        plans: [
          {
            name: "basic",
            priceId: "price_1SKYqAD8qR70pjFErK5C207r", // replace with real Stripe price IDs
            limits: { projects: 5, storage: 10, createGoal: 5 },
          },
          {
            name: "pro",
            priceId: "price_1SKYsZD8qR70pjFEYXwZOCm0",
            limits: { projects: 50, storage: 100, createGoal: 50 },
            freeTrial: { days: 7 },
          },
        ],

        onSubscriptionComplete: async ({ subscription, plan }) => {
          console.log(`🎉 Subscription ${subscription.id} activated for ${plan.name}`);
        },

        onSubscriptionCancel: async ({ subscription }) => {
          console.log(`⚠️ Subscription ${subscription.id} canceled`);
        },
      },
      
    }),
  ],
});
