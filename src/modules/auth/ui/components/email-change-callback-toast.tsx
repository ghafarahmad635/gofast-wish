"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client.ts";


export default function EmailChangeCallbackToast() {
  const sp = useSearchParams();
  const router = useRouter();

  const newEmail = useMemo(() => sp.get("emailChangeConfirmed"), [sp]);

  const { data } = authClient.useSession();
  const userEmail = (data as any)?.user?.email as string | undefined;

  useEffect(() => {
    if (!newEmail) return;

    const stage =
      userEmail && userEmail.toLowerCase() === newEmail.toLowerCase()
        ? "done"
        : "pending-new";

    if (stage === "done") {
      toast.success(`Email updated to ${newEmail}`);
    } else {
      toast.message("Old email approved", {
        description: `Now confirm the new email in ${newEmail} to finish.`,
      });
    }

    // Remove the query param so it won’t toast again on refresh
    router.replace("/profile");
  }, [newEmail, userEmail, router]);

  return null;
}
