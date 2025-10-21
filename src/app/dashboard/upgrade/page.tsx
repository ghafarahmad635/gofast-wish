"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client.ts";

export default function TestStripe() {
  const handleUpgrade = async () => {
    const { error } = await authClient.subscription.upgrade({
      plan: "pro", // must match your plan name in auth.ts
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/`,
    });

    if (error) alert(error.message);
  };

  const handleBillingPortal = async () => {
    try {
      const { data, error } = await authClient.subscription.billingPortal({
        returnUrl: "http://localhost:3000/dashboard", // redirect after managing billing
      });

      if (error) {
        alert(error.message);
        return;
      }

      if (data?.url) {
        window.location.href = data.url; // Redirect to Stripe Billing Portal
      }
    } catch (err) {
      console.error("Failed to open billing portal:", err);
      alert("Something went wrong while opening billing portal.");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen gap-4">
      <Button onClick={handleUpgrade}>Upgrade to Pro</Button>
      <Button variant="outline" onClick={handleBillingPortal}>
        Manage Billing
      </Button>
    </div>
  );
}
