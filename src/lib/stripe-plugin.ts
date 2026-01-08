import Stripe from "stripe";
import { stripe } from "@better-auth/stripe";
import type { StripePlan } from "@better-auth/stripe";
import { db } from "./prisma";
import { sendEmail } from "./email";
import { PaymentReceiptEmail } from "@/components/emails-templates/subscription/PaymentReceiptEmail";
import { TrialStartedEmail } from "@/components/emails-templates/subscription/TrialStartedEmail";
import { TrialEndedEmail } from "@/components/emails-templates/subscription/TrialEndedEmail";
import { SubscriptionActivatedEmail } from "@/components/emails-templates/subscription/SubscriptionActivatedEmail";
import { SubscriptionCanceledEmail } from "@/components/emails-templates/subscription/SubscriptionCanceledEmail";

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

function isStripePlan(v: StripePlan | null): v is StripePlan {
  return v !== null;
}

function getSubscriptionIdFromInvoice(invoice: Stripe.Invoice): string | null {
  const parent: any = (invoice as any).parent;

  if (parent?.type === "subscription_details") {
    return parent.subscription_details?.subscription ?? null;
  }

  const lines: any[] = (invoice.lines?.data as any[]) ?? [];
  for (const line of lines) {
    const subFromLine = line?.parent?.subscription_item_details?.subscription;
    if (subFromLine) return subFromLine;
  }

  return null;
}

async function getUserByReferenceId(referenceId: string) {
  return db.user.findFirst({ where: { id: referenceId } });
}

export const stripePlugin = stripe({
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
    // Only handle what you need (faster, safer)
    if (event.type !== "invoice.paid") return;

    try {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string | null;
      if (!customerId) return;

      const user = await db.user.findFirst({
        where: { stripeCustomerId: customerId },
        select: { id: true, email: true, name: true },
      });
      if (!user?.email) return;

      const subscriptionId = getSubscriptionIdFromInvoice(invoice);

      // Upsert to avoid duplicates if Stripe retries webhook
      await db.order.upsert({
        where: { stripeInvoiceId: invoice.id },
        update: {
          stripeSubscriptionId: subscriptionId,
          amount: (invoice.amount_paid ?? 0) / 100,
          currency: invoice.currency || "usd",
          status: invoice.status ?? "paid",
          hostedInvoiceUrl: invoice.hosted_invoice_url || null,
          invoicePdfUrl: invoice.invoice_pdf || null,
          customerEmail: invoice.customer_email || user.email,
          customerName: invoice.customer_name || user.name,
        },
        create: {
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

      plans: async (): Promise<StripePlan[]> => {
    const rows = await db.plan.findMany({
      where: { isActive: true },
      include: { limits: true },
      orderBy: [{ highlighted: "desc" }, { monthlyPrice: "asc" }],
    });

    const mapped: Array<StripePlan | null> = rows.map((p) => {
      const key = (p.key ?? "").trim(); // stable id: "standard" | "pro"
      const monthlyPriceId = (p.stripeMonthlyPriceId ?? "").trim();
      if (!key || !monthlyPriceId) return null;

      const yearlyPriceId = (p.stripeYearlyPriceId ?? "").trim() || undefined;
      const trialDays = p.trialDays ?? 0;

      return {
        name: key, // IMPORTANT: use key here
        priceId: monthlyPriceId,
        annualDiscountPriceId: yearlyPriceId,

        limits: {
          createWishes: p.limits?.wishesLimit ?? undefined,
          createHabits: p.limits?.habitsLimit ?? undefined,
        },

        freeTrial:
          trialDays > 0
            ? {
                days: trialDays,
                onTrialStart: async (subscription) => {
                  const user = await db.user.findFirst({
                    where: { id: subscription.referenceId },
                  });
                  if (!user?.email) return;

                  await sendEmail({
                    to: user.email,
                    subject: "Your Free Trial Has Started — GoFast Wish",
                    react: TrialStartedEmail({ name: user.name ?? "User" }),
                  });
                },
                onTrialEnd: async ({ subscription }) => {
                  const user = await db.user.findFirst({
                    where: { id: subscription.referenceId },
                  });
                  if (!user?.email) return;

                  await sendEmail({
                    to: user.email,
                    subject: "Your Trial Has Ended — Upgrade Now",
                    react: TrialEndedEmail({ name: user.name ?? "User" }),
                  });
                },
              }
            : undefined,
      };
    });

    return mapped.filter(isStripePlan);
  },

    onSubscriptionComplete: async ({ subscription, plan }) => {
      try {
        const user = await getUserByReferenceId(subscription.referenceId);
        if (!user?.email) return;

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
        const user = await getUserByReferenceId(subscription.referenceId);
        if (!user?.email) return;

        void sendEmail({
          to: user.email,
          subject: "Subscription Canceled — GoFast Wish",
          react: SubscriptionCanceledEmail({
            name: user.name ?? "User",
            message: "We're sorry to see you go. You can reactivate anytime from your dashboard.",
          }),
        });
      } catch (err) {
        console.error("[Stripe:onSubscriptionCancel] Failed:", err);
      }
    },
  },
});
