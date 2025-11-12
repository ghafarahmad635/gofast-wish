"use client";

import { useWatch } from "react-hook-form";
import { useMultiStepForm } from "@/components/multi-step-form-wrapper";
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Trophy } from "lucide-react";
import type { FormValues } from "../../../schema";

const MAX = 300;

export default function StepSuccess() {
  const { form } = useMultiStepForm<FormValues>();
  const val = useWatch({ control: form.control, name: "wish_success" }) ?? "";
  const count = val.length;

  return (
    <Form {...form}>
      <Card className="p-4 md:p-6">
        <FormField
          control={form.control}
          name="wish_success"
          render={({ field }) => (
            <FormItem>
              {/* Row 1: icon left, text right */}
              <div className="flex items-center gap-5">
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                    <Trophy className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
                  </div>
                </div>
                <div className="ml-0">
                  <FormLabel className="text-base leading-6">
                    What does success look like to you specifically
                  </FormLabel>
                  <FormDescription className="leading-5">
                    Paint a clear picture of the end state so we can target it precisely
                  </FormDescription>
                </div>
              </div>

              {/* Row 2: full width field */}
              <div className="mt-3">
                <div className="relative">
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Example: Launch my store with 20 products, 50 orders in first month, break even by month three, and maintain 4.8+ rating"
                      maxLength={MAX}
                      className="min-h-32 resize-y border border-gray-300 pr-24 bg-white"
                      aria-describedby="success-counter"
                    />
                  </FormControl>

                  {/* Live counter */}
                  <span
                    id="success-counter"
                    className="absolute bottom-2 right-2 rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground tabular-nums"
                    aria-live="polite"
                  >
                    {count}/{MAX} characters
                  </span>
                </div>

                <FormMessage />
              </div>
            </FormItem>
          )}
        />
      </Card>
    </Form>
  );
}
