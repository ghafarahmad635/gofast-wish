"use client";

import { useMultiStepForm } from "@/components/multi-step-form-wrapper";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ShoppingBag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { FormValues } from "../../../schema";
import { CurrencyInput } from "../CurrencyInput";


type VarKey = keyof FormValues["variable"];

const fields: Array<{ key: VarKey; label: string; ph: string; step?: number }> = [
  { key: "groceries",     label: "Groceries",     ph: "450", step: 50 },
  { key: "eating_out",    label: "Eating out",    ph: "180", step: 25 },
  { key: "entertainment", label: "Entertainment", ph: "120", step: 25 },
  { key: "shopping",      label: "Shopping",      ph: "100", step: 25 },
  { key: "misc",          label: "Misc",          ph: "90",  step: 25 },
];

export default function VariableStep() {
  const { form } = useMultiStepForm<FormValues>();
  return (
    <Form {...form}>
      <Card className="p-4 md:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
            <ShoppingBag className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <div className="text-base">Variable expenses</div>
            <div className="text-xs text-muted-foreground">Average month</div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {fields.map((f) => (
            <FormField
              key={f.key as string}
              control={form.control}
              name={`variable.${f.key}` as const}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{f.label}</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      value={Number(field.value ?? 0)}
                      onChange={(num) => field.onChange(num)}
                      placeholder={f.ph}
                      step={f.step ?? 25}
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
