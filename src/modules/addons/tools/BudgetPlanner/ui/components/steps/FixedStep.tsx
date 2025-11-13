"use client";

import { useMultiStepForm } from "@/components/multi-step-form-wrapper";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Home } from "lucide-react";
import { Card } from "@/components/ui/card";
import { FormValues } from "../../../schema";
import { CurrencyInput } from "../CurrencyInput";


const fields: Array<{ key: keyof FormValues["fixed"]; label: string; ph: string }> = [
  { key: "housing",       label: "Housing",       ph: "1400" },
  { key: "utilities",     label: "Utilities",     ph: "200" },
  { key: "insurance",     label: "Insurance",     ph: "180" },
  { key: "internet",      label: "Internet",      ph: "70" },
  { key: "phone",         label: "Phone",         ph: "60" },
  { key: "transport",     label: "Transport",     ph: "250" },
  { key: "subscriptions", label: "Subscriptions", ph: "60" },
];

export default function FixedStep() {
  const { form } = useMultiStepForm<FormValues>();
  return (
    <Form {...form}>
      <Card className="p-4 md:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
            <Home className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <div className="text-base">Fixed expenses</div>
            <div className="text-xs text-muted-foreground">Monthly recurring bills</div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {fields.map((f) => (
            <FormField
              key={f.key as string}
              control={form.control}
              name={`fixed.${f.key}` as const}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{f.label}</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      value={Number(field.value ?? 0)}
                      onChange={(num) => field.onChange(num)}
                      placeholder={f.ph}
                      step={100}
                      min={0}
                      aria-label={f.label}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>
      </Card>
    </Form>
  );
}
