"use client";

import { useMultiStepForm } from "@/components/multi-step-form-wrapper";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { FormValues } from "../../../schema";
import { CurrencyInput } from "../CurrencyInput";


export default function GoalsStep() {
  const { form } = useMultiStepForm<FormValues>();

  return (
    <Form {...form}>
      <Card className="p-4 md:p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
            <Target className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <div className="text-base">Goals</div>
            <div className="text-xs text-muted-foreground">Targets and strategy</div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Emergency fund target (USD) */}
          <FormField
            control={form.control}
            name="goals.emergency_fund_target"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Emergency fund target</FormLabel>
                <FormControl>
                  <CurrencyInput
                    value={Number(field.value ?? 0)}
                    onChange={(num) => field.onChange(num)}
                    placeholder="6000"
                    step={100}
                    min={0}
                    aria-label="Emergency fund target"
                  />
                </FormControl>
                <FormDescription>Recommended: 3 to 6 months of core expenses</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Timeframe in months */}
          <FormField
            control={form.control}
            name="goals.timeframe_months"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Timeframe months</FormLabel>
                <FormControl>
                  <Input
                    inputMode="numeric"
                    type="number"
                    min={1}
                    step={1}
                    placeholder="12"
                    {...field}
                    onChange={(e) => {
                      const n = Math.max(1, Number(e.target.value || 0));
                      field.onChange(n);
                    }}
                  />
                </FormControl>
                <FormDescription>How long you plan to reach the target</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Payoff priority */}
        <FormField
          control={form.control}
          name="goals.payoff_priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Debt payoff priority</FormLabel>
              <Select
                value={field.value ?? ""}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose one" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="avalanche">Avalanche high APR first</SelectItem>
                  <SelectItem value="snowball">Snowball smallest balance first</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>Strategy for extra payments</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Optional notes */}
        <FormField
          control={form.control}
          name="goals.savings_goal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Savings goal details optional</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Build 3 months of expenses"
                  maxLength={300}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </Card>
    </Form>
  );
}
