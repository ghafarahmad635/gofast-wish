"use client";

import { useMultiStepForm } from "@/components/multi-step-form-wrapper";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

import { SlidersHorizontal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { FormValues } from "../../../schema";

export default function PrefsStep() {
  const { form } = useMultiStepForm<FormValues>();
  return (
    <Form {...form}>
      <Card className="p-4 md:p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
            <SlidersHorizontal className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <div className="text-base">Preferences</div>
            <div className="text-xs text-muted-foreground">Constraints and notes</div>
          </div>
        </div>

        <FormField
          control={form.control}
          name="prefs.must_keep_subscriptions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Must keep subscriptions</FormLabel>
              <FormDescription>Example Spotify</FormDescription>
              <FormControl><Textarea className="bg-white" placeholder="List services you will keep" maxLength={300} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="prefs.hard_caps"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hard caps</FormLabel>
              <FormDescription>Limits you do not want to exceed</FormDescription>
              <FormControl><Textarea className="bg-white" placeholder="Dining out max 150" maxLength={300} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="prefs.notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl><Textarea className="bg-white" placeholder="Anything else the plan must respect" maxLength={300} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </Card>
    </Form>
  );
}
