"use client";

import { useMultiStepForm } from "@/components/multi-step-form-wrapper";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useFieldArray } from "react-hook-form";
import { CreditCard, Banknote, Plus, Trash } from "lucide-react";
import { Card } from "@/components/ui/card";
import { FormValues } from "../../../schema";
import { CurrencyInput } from "../CurrencyInput";
import { PercentInput } from "../PercentInput";


function DebtList({
  name,
  title,
  icon: Icon,
}: {
  name: "debts.credit_cards" | "debts.loans";
  title: string;
  icon: any;
}) {
  const { form } = useMultiStepForm<FormValues>();
  const { fields, append, remove } = useFieldArray({ control: form.control, name });

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <div className="font-medium">{title}</div>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => append({ name: "", balance: 0, apr: 0, min_payment: 0 })}
        >
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>

      <div className="space-y-3">
        {fields.map((f, idx) => (
          <div key={f.id} className="grid grid-cols-12 gap-3 items-end">
            <div className="col-span-3">
              <FormField
                control={form.control}
                name={`${name}.${idx}.name` as const}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <input
                        className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                        placeholder="Visa"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-3">
              <FormField
                control={form.control}
                name={`${name}.${idx}.balance` as const}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Balance</FormLabel>
                    <FormControl>
                      <CurrencyInput
                        value={Number(field.value ?? 0)}
                        onChange={(num) => field.onChange(num)}
                        placeholder="3200"
                        step={100}
                        min={0}
                        aria-label="Balance"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-3">
              <FormField
                control={form.control}
                name={`${name}.${idx}.apr` as const}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>APR</FormLabel>
                    <FormControl>
                      <PercentInput
                        value={Number(field.value ?? 0)}
                        onChange={(num) => field.onChange(num)}
                        placeholder="24.9"
                        step={0.1}
                        min={0}
                        max={100}
                        aria-label="APR"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-2">
              <FormField
                control={form.control}
                name={`${name}.${idx}.min_payment` as const}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min pay</FormLabel>
                    <FormControl>
                      <CurrencyInput
                        value={Number(field.value ?? 0)}
                        onChange={(num) => field.onChange(num)}
                        placeholder="75"
                        step={25}
                        min={0}
                        aria-label="Minimum payment"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-1 flex justify-end">
              <Button type="button" variant="ghost" size="icon" onClick={() => remove(idx)} aria-label="Remove">
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {fields.length === 0 && (
          <div className="text-xs text-muted-foreground">No items added</div>
        )}
      </div>
    </div>
  );
}

export default function DebtsStep() {
  const { form } = useMultiStepForm<FormValues>();
  return (
    <Form {...form}>
      <Card className="p-4 md:p-6 space-y-6">
        <DebtList name="debts.credit_cards" title="Credit cards" icon={CreditCard} />
        <DebtList name="debts.loans" title="Loans" icon={Banknote} />
      </Card>
    </Form>
  );
}
