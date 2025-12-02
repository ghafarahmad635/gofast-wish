"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import type { UserRow } from "./columns";

// schema for ban form
const banUserSchema = z.object({
  reason: z.string().min(1, "Reason is required"),
  duration: z.enum(["1d", "7d", "30d", "never"]),
});

type BanUserFormValues = z.infer<typeof banUserSchema>;

type BanUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserRow | null;
  onBan: (reason: string, durationSeconds?: number) => Promise<void>;
  onUnban: () => Promise<void>;
};

export function BanUserDialog({
  open,
  onOpenChange,
  user,
  onBan,
  onUnban,
}: BanUserDialogProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<BanUserFormValues>({
    resolver: zodResolver(banUserSchema),
    defaultValues: {
      reason: "",
      duration: "never",
    },
  });

  const isBanned = !!user?.banned;

  if (!user) {
    return null;
  }

  // handle ban submit with form values
  const handleSubmitBan = async (values: BanUserFormValues) => {
    let seconds: number | undefined;

    if (values.duration === "1d") seconds = 60 * 60 * 24;
    if (values.duration === "7d") seconds = 60 * 60 * 24 * 7;
    if (values.duration === "30d") seconds = 60 * 60 * 24 * 30;
    if (values.duration === "never") seconds = undefined;

    setLoading(true);
    await onBan(values.reason, seconds);
    setLoading(false);

    // optional: reset form after success
    form.reset({ reason: "", duration: "never" });
  };

  const handleUnbanClick = async () => {
    setLoading(true);
    await onUnban();
    setLoading(false);
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isBanned ? `Unban ${user.email}` : `Ban ${user.email}`}
      description={
        isBanned
          ? "This user is currently banned. Do you want to unban them?"
          : "Banned users cannot sign in until the ban expires."
      }
    >
      {/* UNBAN MODE */}
      {isBanned ? (
        <div className="space-y-4 text-sm p-4">
          <p>
            User: <span className="font-mono">{user.email}</span>
          </p>
          <p>Are you sure you want to unban this user?</p>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUnbanClick}
              disabled={loading}
            >
              {loading ? "Unbanning..." : "Unban user"}
            </Button>
          </div>
        </div>
      ) : (
        // BAN MODE
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmitBan)}
            className="space-y-4  text-sm"
          >
            <div>
              <p>
                User: <span className="font-mono">{user.email}</span>
              </p>
            </div>

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Spam, abuse, chargeback, etc."
                      className="min-h-[80px] bg-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ban duration</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1d">1 day</SelectItem>
                        <SelectItem value="7d">7 days</SelectItem>
                        <SelectItem value="30d">30 days</SelectItem>
                        <SelectItem value="never">Never expires</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Banning..." : "Ban user"}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </ResponsiveDialog>
  );
}
