"use client";

import { useEffect } from "react";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { GetManyAddons } from "../../types";

export type AddonRow = GetManyAddons[number];

const metaSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  isPremium: z.boolean(),
});

export type MetaFormValues = z.infer<typeof metaSchema>;

type EditAddonMetaDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addon: AddonRow | null;
  loading: boolean;
  onSave: (values: MetaFormValues) => Promise<void> | void;
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
    },
  });

  useEffect(() => {
    if (open && addon) {
      form.reset({
        name: addon.name,
        description: addon.description ?? "",
        isPremium: addon.isPremium,
      });
    }
  }, [open, addon, form]);

  if (!addon) return null;

  const handleSubmit = async (values: MetaFormValues) => {
    await onSave(values);
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Edit addon: ${addon.name}`}
      description="Edit the name, description and premium status for this addon."
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
                    value={field.value ?? ""} // ensure string
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Premium toggle */}
          <FormField
            control={form.control}
            name="isPremium"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-md border px-3 py-2 bg-white">
                <div>
                  <FormLabel>Premium addon</FormLabel>
                  <p className="text-xs text-muted-foreground">
                    Mark this addon as part of the premium tier.
                  </p>
                </div>
                <FormControl>
                   <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="
                      data-[state=unchecked]:bg-slate-300
                     
                    "
                  />
                </FormControl>
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
              {loading ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </Form>
    </ResponsiveDialog>
  );
}
