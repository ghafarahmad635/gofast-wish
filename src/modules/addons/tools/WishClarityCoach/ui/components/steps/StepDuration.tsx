"use client";

import { useWatch } from "react-hook-form";
import { useMultiStepForm } from "@/components/multi-step-form-wrapper";
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Clock } from "lucide-react";
import type { FormValues } from "../../../schema";

const MAX = 300;

export default function StepDuration() {
  const { form } = useMultiStepForm<FormValues>();
  const val = useWatch({ control: form.control, name: "wish_duration" }) ?? "";
  const count = val.length;

  return (
    <Form {...form}>
      <Card className="p-4 md:p-6">
        <FormField
          control={form.control}
          name="wish_duration"
          render={({ field }) => (
            <FormItem>
              {/* Row 1: icon left, text right (no extra gap) */}
              <div className="flex items-center gap-5">
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                    <Clock className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
                  </div>
                </div>
                <div className="ml-0">
                  <FormLabel className="text-base leading-6">
                    How long have you wanted to do this
                  </FormLabel>
                  <FormDescription className="leading-5">
                    Share the timeline or how long this has been on your mind
                  </FormDescription>
                </div>
              </div>

              {/* Row 2: full width field */}
              <div className="mt-3">
                <div className="relative">
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Example: Been thinking about it for 6 months. First considered it last year after a friend’s success."
                      maxLength={MAX}
                      className="min-h-32 resize-y border border-gray-300 pr-24 bg-white"
                      aria-describedby="duration-counter"
                    />
                  </FormControl>

                  {/* Live counter */}
                  <span
                    id="duration-counter"
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
