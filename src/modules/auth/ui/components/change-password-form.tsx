"use client";

import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

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

import {
  Loader2,
  CheckCircle2,
  OctagonAlertIcon,
  KeyRound,
  Eye,
  EyeOff,
} from "lucide-react";
import { authClient } from "@/lib/auth-client.ts";
import { changePasswordSchema, ChangePasswordValues } from "../../schema";



function PasswordInput({
  value,
  onChange,
  disabled,
  autoComplete,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  autoComplete?: string;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <Input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="pr-10"
      />
      <button
        type="button"
        aria-label={show ? "Hide password" : "Show password"}
        onClick={() => setShow((s) => !s)}
        disabled={disabled}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export default function ChangePasswordForm() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { data, isPending } = authClient.useSession();
  const user = data?.user;

  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
    mode: "onSubmit",
  });

  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting, isDirty },
  } = form;

  const busy = isPending || isSubmitting;

  const onSubmit = async (values: ChangePasswordValues) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { error } = await authClient.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        revokeOtherSessions: true,
      });

      if (error) {
        const msg = error.message ?? "Failed to change password";
        setErrorMsg(msg);
        toast.error(msg);
        return;
      }

      setSuccessMsg("Password changed successfully.");
      toast.success("Password changed");
      reset(
        { currentPassword: "", newPassword: "", confirmPassword: "" },
        { keepDirty: false }
      );
    } catch (e: any) {
      const msg = e?.message ?? "Something went wrong";
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  return (
    <Card className="overflow-hidden p-0 w-full">
      <CardContent className="p-0">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8">
            {!user ? (
              <Alert className="bg-destructive/10 border-none">
                <OctagonAlertIcon className="h-4 w-4 !text-destructive" />
                <AlertTitle>
                  You must be signed in to change your password
                </AlertTitle>
              </Alert>
            ) : (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-5 w-5 text-muted-foreground" />
                    <h1 className="text-2xl font-bold">Change password</h1>
                  </div>
                  <p className="text-muted-foreground text-balance">
                    Update your password and sign out other sessions.
                  </p>
                </div>

                <FormField
                  control={control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current password</FormLabel>
                      <FormControl>
                        <PasswordInput
                          value={field.value}
                          onChange={field.onChange}
                          disabled={busy}
                          autoComplete="current-password"
                          placeholder="••••••••"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New password</FormLabel>
                      <FormControl>
                        <PasswordInput
                          value={field.value}
                          onChange={field.onChange}
                          disabled={busy}
                          autoComplete="new-password"
                          placeholder="At least 8 characters"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm password</FormLabel>
                      <FormControl>
                        <PasswordInput
                          value={field.value}
                          onChange={field.onChange}
                          disabled={busy}
                          autoComplete="new-password"
                          placeholder="Repeat new password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-3">
                  <Button
                    disabled={busy || !isDirty}
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    {busy ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Change password"
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
                    className="shrink-0"
                    disabled={busy}
                  >
                    Reset
                  </Button>
                </div>

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
}
