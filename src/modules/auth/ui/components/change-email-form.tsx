"use client";

import { useEffect, useState } from "react";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Loader2, OctagonAlertIcon, CheckCircle2, Mail } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client.ts";

const changeEmailSchema = z.object({
  newEmail: z.email("Enter a valid email"),
  
});

type ChangeEmailValues = z.infer<typeof changeEmailSchema>;

const ChangeEmailForm = () => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { data, error, isPending } = authClient.useSession();
  const user = (data as any)?.user;

  const form = useForm<ChangeEmailValues>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: {
      newEmail: "",
      
    },
    mode: "onSubmit",
  });

  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting, isDirty },
  } = form;

  useEffect(() => {
    if (error?.message) setErrorMsg(error.message);
  }, [error?.message]);

  const onSubmit = async (values: ChangeEmailValues) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    // Keep toasts minimal (only 1 success or 1 error)
    try {
      const { error } = await authClient.changeEmail({
        newEmail: values.newEmail,
        callbackURL: `/profile?emailChangeConfirmed=${values.newEmail}`,
        
      });

      if (error) {
        const msg = error.message ?? "Failed to start email change";
        setErrorMsg(msg);
        toast.error(msg);
        return;
      }

      const msg =
        "Check your email to confirm the change. Your email will update after verification.";
      setSuccessMsg(msg);
      toast.success("Confirmation email sent");

      reset({ ...values, newEmail: "" }, { keepDirty: false });
    } catch (e: any) {
      const msg = e?.message ?? "Something went wrong";
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  const busy = isPending || isSubmitting;

  return (
    <Card className="overflow-hidden p-0 w-full">
      <CardContent className="p-0">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8">
            {isPending ? (
              <ChangeEmailSkeleton />
            ) : !user ? (
              <Alert className="bg-destructive/10 border-none">
                <OctagonAlertIcon className="h-4 w-4 !text-destructive" />
                <AlertTitle>You must be signed in to change your email</AlertTitle>
              </Alert>
            ) : (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <h1 className="text-2xl font-bold">Email</h1>
                  </div>
                  <p className="text-muted-foreground text-balance">
                    We’ll send a confirmation link before updating your email.
                  </p>

                  {/* Current email */}
                  <div className="mt-3 text-sm text-muted-foreground">
                    Current: <span className="text-foreground">{user?.email}</span>
                  </div>
                </div>

                <FormField
                  control={control}
                  name="newEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="new-email@example.com"
                          {...field}
                          disabled={busy}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Buttons */}
                <div className="flex gap-3">
                  <Button
                    disabled={busy || !isDirty}
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 shrink"
                  >
                    {busy ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send confirmation"
                    )}
                  </Button>

                  <Button
                    type="button"
                    onClick={() => {
                      reset();
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    variant="outline"
                    className="w-auto shrink-0"
                    disabled={busy}
                  >
                    Reset
                  </Button>
                </div>

                {/* Inline messages (optional but useful) */}
                {successMsg && (
                  <Alert className="bg-emerald-500/10 border-none">
                    <CheckCircle2 className="h-4 w-4 !text-emerald-600" />
                    <AlertTitle>{successMsg}</AlertTitle>
                  </Alert>
                )}

                {errorMsg && (
                  <Alert className="bg-destructive/10 border-none">
                    <OctagonAlertIcon className="h-4 w-4 !text-destructive" />
                    <AlertTitle>{errorMsg}</AlertTitle>
                  </Alert>
                )}
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ChangeEmailForm;

function ChangeEmailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center text-center gap-2">
        <div className="h-7 w-32 rounded-md bg-muted animate-pulse" />
        <div className="h-4 w-64 rounded-md bg-muted animate-pulse" />
        <div className="h-4 w-40 rounded-md bg-muted animate-pulse mt-2" />
      </div>

      <div className="space-y-2">
        <div className="h-4 w-20 rounded bg-muted animate-pulse" />
        <div className="h-10 w-full rounded-md bg-muted animate-pulse" />
      </div>

      <div className="flex gap-3">
        <div className="h-10 flex-1 rounded-md bg-muted animate-pulse" />
        <div className="h-10 w-24 rounded-md bg-muted animate-pulse" />
      </div>
    </div>
  );
}
