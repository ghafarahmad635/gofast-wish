"use client";

import { useEffect, useState } from "react";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { toast } from "sonner";

import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { GetOneAddon } from "../../types";
import { uploadFiles } from "@/lib/utils/uploadthingClient";
import FeaturedImageUpload from "@/modules/goals/ui/components/FeaturedImageUpload";

export type AddonRow = Partial<GetOneAddon>;

// zod schema for the meta form
const metaSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  isPremium: z.boolean(),
  file: z.any().optional(),
  iconId: z.string().nullable().optional(),
});

export type MetaFormValues = z.infer<typeof metaSchema>;

type EditAddonMetaDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addon: AddonRow | null;
  loading: boolean;
  onSave: (values: {
    name: string;
    description?: string;
    isPremium: boolean;
    iconId?: string;
  }) => Promise<void> | void;
};

export function EditAddonMetaDialog({
  open,
  onOpenChange,
  addon,
  loading,
  onSave,
}: EditAddonMetaDialogProps) {
  const form = useForm<MetaFormValues>({
    resolver: zodResolver(metaSchema),
    defaultValues: {
      name: addon?.name ?? "",
      description: addon?.description ?? "",
      isPremium: addon?.isPremium ?? false,
      file: undefined,
      iconId: addon?.iconId ?? null,
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // what kind of process are we doing
  const [status, setStatus] = useState<"idle" | "uploading" | "saving">("idle");
  // whether we should show the upload step at all
  const [hasUploadStep, setHasUploadStep] = useState(false);

  useEffect(() => {
    if (open && addon) {
      form.reset({
        name: addon.name,
        description: addon.description ?? "",
        isPremium: addon.isPremium,
        file: undefined,
        iconId: addon.iconId ?? null,
      });
      setStatus("idle");
      setHasUploadStep(false);
      setIsSubmitting(false);
    }
  }, [open, addon, form]);

  if (!addon) return null;

  const handleSubmit = async (values: MetaFormValues) => {
    console.log("Submitting addon meta form with values:", values);

    // will we actually upload a new file this submit
    const willUpload = values.file && values.file instanceof File;

    setHasUploadStep(Boolean(willUpload));
    setIsSubmitting(true);
    setStatus(willUpload ? "uploading" : "saving");

    try {
      // start with the existing iconId in DB
      let iconId: string | undefined = addon.iconId ?? undefined;

      // Case 1: user picked a new file → upload & replace old
      if (willUpload) {
        const uploadRes = await uploadFiles("goalImageUploader", {
          files: [values.file as File],
        });

        const uploaded = uploadRes?.[0];

        if (uploaded?.serverData?.mediaId) {
          iconId = uploaded.serverData.mediaId; // save Media ID
        } else {
          toast.error("Icon upload failed");
          setStatus("idle");
          setIsSubmitting(false);
          return;
        }

        // after upload finished, now we are in "saving" step
        setStatus("saving");
      }

      // Case 2: user removed image (no file AND iconId cleared in the form)
      // This assumes FeaturedImageUpload sets form.iconId = null/undefined when user removes image
      if (!willUpload && !form.getValues("iconId") && addon.iconId) {
        iconId = undefined;
      }

      await onSave({
        name: values.name,
        description: values.description,
        isPremium: values.isPremium,
        iconId,
      });

      setStatus("idle");
    } catch (error: any) {
      console.error("Failed to save addon:", error);
      toast.error(error?.message || "Something went wrong while saving the addon");
      setStatus("idle");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBusy = isSubmitting || loading;

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Edit addon: ${addon.name}`}
      description="Edit the name, description, premium status, and icon for this addon."
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4 p-2 text-sm"
        >
          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Addon name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    className="bg-white"
                    rows={3}
                    placeholder="Short description of the addon"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Icon: same component as goals */}
          <FeaturedImageUpload
            form={form}
            name="file"
            initialImage={addon.icon?.url ?? null}
            // make sure this sets form.iconId to null when user removes the image
          />

          {/* Simple status indicator */}
          {isBusy && (
            <div className="rounded-md border bg-slate-50 px-3 py-2 text-xs space-y-1">
              <p className="font-medium text-slate-700">Processing addon</p>

              {hasUploadStep && (
                <p
                  className={
                    status === "uploading"
                      ? "font-semibold text-slate-900"
                      : "text-slate-500"
                  }
                >
                  Uploading icon{status === "uploading" && " ..."}
                </p>
              )}

              <p
                className={
                  status === "saving"
                    ? "font-semibold text-slate-900"
                    : "text-slate-500"
                }
              >
                Saving changes{status === "saving" && " ..."}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isBusy}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isBusy}>
              {status === "uploading"
                ? "Uploading icon..."
                : status === "saving"
                ? "Saving changes..."
                : isBusy
                ? "Working..."
                : "Save changes"}
            </Button>
          </div>
        </form>
      </Form>
    </ResponsiveDialog>
  );
}
