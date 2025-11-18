"use client";

import { useMultiStepForm } from "@/components/multi-step-form-wrapper";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useWatch } from "react-hook-form";
import { FormValues } from "../../../schema";

export default function ReviewStep() {
  const { form } = useMultiStepForm<FormValues>();
  const v = useWatch({ control: form.control }) as FormValues;

  const income =
    (v.net_monthly_income || 0) + (v.other_income || 0);
  const fixed = v.fixed
    ? Object.values(v.fixed).reduce(
        (a: number, b: number) => a + (b || 0),
        0,
      )
    : 0;
  const variable = v.variable
    ? Object.values(v.variable).reduce(
        (a: number, b: number) => a + (b || 0),
        0,
      )
    : 0;
  const mins = [...(v.debts?.credit_cards || []), ...(v.debts?.loans || [])].reduce(
    (a, d) => a + (d.min_payment || 0),
    0,
  );
  const essentials = fixed + variable + mins;
  const surplus = income - essentials;

  const planCount = v.plan_count ?? 3;

  return (
    <Card className="p-4 md:p-6 space-y-4">
      <div className="text-base font-medium">Review totals</div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
        <Stat label="Income" value={income} />
        <Stat label="Fixed" value={fixed} />
        <Stat label="Variable" value={variable} />
        <Stat label="Min payments" value={mins} />
        <Stat label="Essentials" value={essentials} />
        <Stat label="Surplus" value={surplus} highlight />
      </div>

      {/* 👇 New section: how many plans to generate */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-muted-foreground">
          How many AI budget plans do you want to see?
        </div>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Button
              key={n}
              type="button"
              size="sm"
              variant={planCount === n ? "default" : "outline"}
              onClick={() => form.setValue("plan_count", n)}
              className="px-3"
            >
              {n}
            </Button>
          ))}
        </div>
        <div className="text-[11px] text-muted-foreground">
          You can compare different strategies side by side. Most people start with 3 plans.
        </div>
      </div>

      <Separator />

      <div className="text-xs text-muted-foreground">
        Submit to generate the AI plan. You can go back to edit any step.
      </div>
    </Card>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-md border p-3 ${
        highlight ? "bg-emerald-50 dark:bg-emerald-950/20" : "bg-white "
      }`}
    >
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="text-base font-semibold tabular-nums">
        ${value.toFixed(2)}
      </div>
    </div>
  );
}
