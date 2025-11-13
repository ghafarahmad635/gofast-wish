"use client";

import { useMultiStepForm } from "@/components/multi-step-form-wrapper";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DollarSign } from "lucide-react";
import { Card } from "@/components/ui/card";
import { FormValues } from "../../../schema";
import { CurrencyInput } from "../CurrencyInput";


export default function IncomeStep() {
  const { form } = useMultiStepForm<FormValues>();

  return (
    <Form {...form}>
      <Card className="p-4 md:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
            <DollarSign className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <div className="text-base">Monthly income</div>
            <div className="text-xs text-muted-foreground">Enter take home amounts</div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="net_monthly_income"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Net monthly income</FormLabel>
                <FormControl>
                  <CurrencyInput
                    value={Number(field.value ?? 0)}
                    onChange={(num) => field.onChange(num)}
                    placeholder="4200"
                    step={100}
                    min={0}
                    aria-label="Net monthly income"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="other_income"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Other income</FormLabel>
                <FormControl>
                  <CurrencyInput
                    value={Number(field.value ?? 0)}
                    onChange={(num) => field.onChange(num)}
                    placeholder="300"
                    step={100}
                    min={0}
                    aria-label="Other income"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Card>
    </Form>
  );
}
