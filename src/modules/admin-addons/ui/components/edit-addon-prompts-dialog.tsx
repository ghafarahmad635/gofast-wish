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
import { Textarea } from "@/components/ui/textarea";
import type { GetManyAddons } from "../../types";

export type AddonRow = GetManyAddons[number];

const promptsSchema = z.object({
  systemPrompt: z.string().optional(),
  customPrompt: z.string().optional(),
});

export type PromptsFormValues = z.infer<typeof promptsSchema>;

type EditAddonPromptsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addon: AddonRow | null;
  loading: boolean;
  onSave: (values: PromptsFormValues) => Promise<void> | void;
};

export function EditAddonPromptsDialog({
  open,
  onOpenChange,
  addon,
  loading,
  onSave,
}: EditAddonPromptsDialogProps) {
  const form = useForm<PromptsFormValues>({
    resolver: zodResolver(promptsSchema),
    defaultValues: {
      systemPrompt: addon?.systemPrompt ?? "",
      customPrompt: addon?.customPrompt ?? "",
    },
  });

  useEffect(() => {
    if (open && addon) {
      form.reset({
        systemPrompt: addon.systemPrompt ?? "",
        customPrompt: addon.customPrompt ?? "",
      });
    }
  }, [open, addon, form]);

  if (!addon) return null;

  const handleSubmit = async (values: PromptsFormValues) => {
    await onSave(values);
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Edit prompts: ${addon.name}`}
      description="Update system and custom prompts for this addon."
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4 text-sm"
        >
          <FormField
            control={form.control}
            name="systemPrompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>System prompt</FormLabel>
                <FormControl>
                  <Textarea
                    className="bg-white"
                    rows={4}
                    placeholder="System level instructions for this addon"
                    value={field.value ?? ""} // ensure string
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="customPrompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custom prompt</FormLabel>
                <FormControl>
                  <Textarea
                    className="bg-white"
                    rows={4}
                    placeholder="User facing or additional prompt content"
                    value={field.value ?? ""} // ensure string
                    onChange={field.onChange}
                  />
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
              {loading ? "Saving..." : "Save prompts"}
            </Button>
          </div>
        </form>
      </Form>
    </ResponsiveDialog>
  );
}
