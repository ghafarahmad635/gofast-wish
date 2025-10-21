"use client";


import { Button } from "@/components/ui/button";

import { authClient } from "@/lib/auth-client.ts";

export default function TestStripe() {
  const handleUpgrade = async () => {
    const { error } = await authClient.subscription.upgrade({
      plan: "pro", // must match plan name in auth.ts
      successUrl: "http://localhost:3000/dashboard",
      cancelUrl: "http://localhost:3000/pricing",
    });

    if (error) alert(error.message);
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Button onClick={handleUpgrade}>Upgrade to Pro</Button>
    </div>
  );
}
