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
      },

      // ✅ move the subscription config INSIDE the stripe plugin
      subscription: {
        enabled: true,
        requireEmailVerification: false,

        plans: [
          {
            name: "basic",
            priceId: "price_1SKYqAD8qR70pjFErK5C207r", // replace with real Stripe price IDs
            limits: { projects: 5, storage: 10 },
          },
          {
            name: "pro",
            priceId: "price_1SKYsZD8qR70pjFEYXwZOCm0",
            limits: { projects: 50, storage: 100 },
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
