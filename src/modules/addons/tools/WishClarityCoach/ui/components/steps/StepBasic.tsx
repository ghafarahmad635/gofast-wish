"use client";

import { useWatch } from "react-hook-form";
import { useMultiStepForm } from "@/components/multi-step-form-wrapper";
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles } from "lucide-react";
import type { FormValues } from "../../../schema";

const MAX = 300;

export default function StepBasic() {
  const { form } = useMultiStepForm<FormValues>();
  const goal = useWatch({ control: form.control, name: "goal" }) ?? "";
  const count = goal.length;

  return (
    <Form {...form}>
      <Card className="p-4 md:p-6">
        <FormField
          control={form.control}
          name="goal"
          render={({ field }) => (
            <FormItem>
              {/* Row 1: icon and text with no gap */}
              <div className="flex items-center  gap-5">
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                    <Sparkles className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
                  </div>
                </div>
                <div className="ml-0">
                  <FormLabel className="text-base leading-6">
                    Describe a dream or goal you are thinking about
                  </FormLabel>
                  <FormDescription className="leading-5">
                    Min 1 character. Max 300 characters.
                  </FormDescription>
                </div>
              </div>

              {/* Row 2: full width field */}
              <div className="mt-3">
                <div className="relative">
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Example: I want to learn to play the piano, start a small business, travel to Japan, write a book"
                      maxLength={MAX}
                      className="min-h-32 resize-y border border-gray-300 pr-24 bg-white"
                      aria-describedby="goal-counter"
                    />
                  </FormControl>

                  <span
                    id="goal-counter"
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
