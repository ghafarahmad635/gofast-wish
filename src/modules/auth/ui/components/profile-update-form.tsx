"use client";

import React, { useEffect, useMemo, useState } from "react";
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

import { Loader2, OctagonAlertIcon, CheckCircle2 } from "lucide-react";

import { profileSchema, ProfileValues } from "../../schema";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { TIMEZONES } from "../../constant";
import ProfileImageUpload from "./ProfileImageUpload";
import { uploadFiles } from "@/lib/utils/uploadthingClient";

import { toast } from "sonner";
import { authClient } from "@/lib/auth-client.ts";

type SubmitPhase = "idle" | "uploading" | "saving";

const ProfileUpdateForm = () => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [phase, setPhase] = useState<SubmitPhase>("idle");

  const { data, error, isPending, refetch } = authClient.useSession();
  const user = (data as any)?.user;

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      image: "",
      country: "",
      timezone: "UTC",
      file: undefined,
    },
    mode: "onSubmit",
  });

  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting, isDirty },
  } = form;

  const initialValues = useMemo(
    () => ({
      name: user?.name ?? "",
      image: user?.image ?? "",
      country: user?.country ?? "",
      timezone: user?.timezone ?? "UTC",
      file: undefined,
    }),
    [user?.name, user?.image, user?.country, user?.timezone]
  );

  useEffect(() => {
    if (user) reset(initialValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (error?.message) {
      setErrorMsg(error.message);
      toast.error(error.message); // ✅ only when there is an error
    }
  }, [error?.message]);

  const onSubmit = async (values: ProfileValues) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    let imageUrl: string | null = values.image ? values.image : null;

    try {
      // 1) Upload if needed
      if (values.file && values.file instanceof File) {
        setPhase("uploading");

        const uploadRes = await uploadFiles("avatarUploader", {
          files: [values.file],
        });

        const uploaded = uploadRes?.[0] as any;

        // ✅ keep your direct usage if it works:
        // const url = uploaded?.ufsUrl;

        // ✅ slightly safer (recommended):
        const url = uploaded?.ufsUrl || uploaded?.serverData?.ufsUrl || uploaded?.url;

        if (!url) {
          const msg = "Image upload failed";
          setErrorMsg(msg);
          toast.error(msg);
          return;
        }

        imageUrl = url;
      }

      // 2) Save profile
      setPhase("saving");

      const { error } = await authClient.updateUser({
        name: values.name,
        image: imageUrl,
        country: values.country ? values.country : null,
        timezone: values.timezone ? values.timezone : "UTC",
      });

      if (error) {
        const msg = error.message ?? "Failed to update profile";
        setErrorMsg(msg);
        toast.error(msg);
        return;
      }

      // 3) Refresh session
      await refetch();

      reset(
        { ...values, image: imageUrl ?? "", file: undefined },
        { keepDirty: false }
      );

      setSuccessMsg("Profile updated");
      toast.success("Profile updated"); // ✅ only on success
    } catch (e: any) {
      const msg = e?.message ?? "Something went wrong";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setPhase("idle");
    }
  };

  const isBusy = isSubmitting || phase !== "idle";

  const buttonLabel =
    phase === "uploading"
      ? "Uploading..."
      : phase === "saving"
        ? "Saving..."
        : "Save changes";

  return (
    <Card className="overflow-hidden p-0 w-full">
      <CardContent className="p-0">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8">
            {isPending ? (
              <ProfileFormSkeleton />
            ) : !user ? (
              <Alert className="bg-destructive/10 border-none">
                <OctagonAlertIcon className="h-4 w-4 !text-destructive" />
                <AlertTitle>You must be signed in to edit your profile</AlertTitle>
              </Alert>
            ) : (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">Profile</h1>
                  <p className="text-muted-foreground text-balance">
                    Update your account details
                  </p>
                </div>

                {/* Avatar */}
                <ProfileImageUpload
                  form={form}
                  name="file"
                  initialImage={user?.image ?? null}
                  disabled={isBusy}
                />

                {/* Small inline status (no toast spam) */}
                {phase === "uploading" && (
                  <p className="text-sm text-muted-foreground">Uploading image…</p>
                )}
                {phase === "saving" && (
                  <p className="text-sm text-muted-foreground">Saving changes…</p>
                )}

                {/* Name */}
                <FormField
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="John Doe"
                          {...field}
                          disabled={isBusy}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Country */}
                <FormField
                  control={control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="United States"
                          {...field}
                          disabled={isBusy}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Timezone */}
                <FormField
                  control={control}
                  name="timezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timezone</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value || "UTC"}
                          onValueChange={field.onChange}
                          disabled={isBusy}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select timezone" />
                          </SelectTrigger>
                          <SelectContent>
                            {TIMEZONES.map((tz) => (
                              <SelectItem key={tz} value={tz}>
                                {tz}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Buttons */}
                <div className="flex gap-3">
                  <Button
                    disabled={isBusy || !isDirty}
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 shrink"
                  >
                    {isBusy ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {buttonLabel}
                      </>
                    ) : (
                      buttonLabel
                    )}
                  </Button>

                  <Button
                    type="button"
                    onClick={() => {
                      reset(initialValues);
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    variant="outline"
                    className="w-auto shrink-0"
                    disabled={isBusy}
                  >
                    Reset
                  </Button>
                </div>

                {/* Optional inline messages (keep or remove) */}
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

export default ProfileUpdateForm;

function ProfileFormSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center text-center gap-2">
        <div className="h-7 w-32 rounded-md bg-muted animate-pulse" />
        <div className="h-4 w-56 rounded-md bg-muted animate-pulse" />
      </div>

      {Array.from({ length: 4 }).map((_, i) => (
        <div className="space-y-2" key={i}>
          <div className="h-4 w-24 rounded bg-muted animate-pulse" />
          <div className="h-10 w-full rounded-md bg-muted animate-pulse" />
        </div>
      ))}

      <div className="flex gap-3">
        <div className="h-10 flex-1 rounded-md bg-muted animate-pulse" />
        <div className="h-10 w-24 rounded-md bg-muted animate-pulse" />
      </div>
    </div>
  );
}
