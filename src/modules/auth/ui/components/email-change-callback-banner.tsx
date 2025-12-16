"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, X } from "lucide-react";
import { authClient } from "@/lib/auth-client.ts";


export default function EmailChangeCallbackBanner() {
  const sp = useSearchParams();
  const router = useRouter();

  const [open, setOpen] = useState(true);

  const newEmail = useMemo(() => sp.get("emailChangeConfirmed"), [sp]);

  const { data, isPending } = authClient.useSession();
  const userEmail = (data as any)?.user?.email as string | undefined;

  const stage = useMemo(() => {
    if (!newEmail) return null;
    if (!userEmail) return "unknown";
    return userEmail.toLowerCase() === newEmail.toLowerCase()
      ? "done"
      : "pending-new";
  }, [newEmail, userEmail]);

  // Reset banner when a new callback comes in
  useEffect(() => {
    if (newEmail) setOpen(true);
  }, [newEmail]);

  // Auto hide after a delay, then clean the URL
  useEffect(() => {
    if (!newEmail || !open) return;

    const hideMs = 8000; // change this (ex: 10000 for 10s)
    const hideTimer = setTimeout(() => setOpen(false), hideMs);

    return () => clearTimeout(hideTimer);
  }, [newEmail, open]);

  // When closed, clean URL so it won't show again on refresh
  useEffect(() => {
    if (!newEmail) return;
    if (!open) router.replace("/profile");
  }, [open, newEmail, router]);

  if (!newEmail || !open) return null;

  return (
    <Alert className="bg-emerald-500/10 border-none mb-4 relative pr-10">
      <CheckCircle2 className="h-4 w-4 !text-emerald-600" />
      <AlertTitle>
        {isPending ? (
          "Processing email verification..."
        ) : stage === "done" ? (
          <>
            Email updated successfully to{" "}
            <span className="font-semibold">{newEmail}</span>.
          </>
        ) : (
          <>
            Old email approved. Now confirm the new email in{" "}
            <span className="font-semibold">{newEmail}</span> to finish the change.
          </>
        )}
      </AlertTitle>

      <button
        type="button"
        aria-label="Close"
        onClick={() => setOpen(false)}
        className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <X className="h-4 w-4" />
      </button>
    </Alert>
  );
}
