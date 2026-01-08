"use client";

import React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PlanGetOne } from "../../types";

function money(cents: number | null | undefined) {
  const v = typeof cents === "number" ? cents : 0;
  return (v / 100).toFixed(2);
}

function LimitValue({ v }: { v: number | null | undefined }) {
  return <span className="font-medium text-foreground">{v ?? "Unlimited"}</span>;
}





type PlanCardProps = {
  plan: PlanGetOne;
  onEdit: (plan: PlanGetOne) => void;
};

export function PlanCard({ plan, onEdit }: PlanCardProps) {
  const isFree = plan.key === "free";
  const features = plan.features ?? [];

  return (
    <Card className="relative">
      <CardHeader className="py-3 pb-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base truncate">{plan.name}</CardTitle>

              {plan.highlighted && (
                <Badge className="h-5 px-2 text-[11px] bg-primary text-primary-foreground hover:bg-primary">
                  Highlight
                </Badge>
              )}
            </div>

            {plan.description ? (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {plan.description}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground italic">No description</p>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => onEdit(plan)}
          >
            Edit
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-3 space-y-3">
        {/* Prices */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-md border px-3 py-2">
            <div className="text-[11px] text-muted-foreground">Monthly</div>
            <div className="text-base font-semibold">${money(plan.monthlyPrice)}</div>
          </div>
          <div className="rounded-md border px-3 py-2">
            <div className="text-[11px] text-muted-foreground">Yearly</div>
            <div className="text-base font-semibold">${money(plan.yearlyPrice)}</div>
          </div>
        </div>

        {/* Trial + Limits */}
        <div className="rounded-md border px-3 py-2 space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs">
              <span className="font-medium">Trial</span>{" "}
              <span className="text-muted-foreground">
                {isFree ? "(none)" : `(${plan.trialDays ?? 0} days)`}
              </span>
            </div>

            {!isFree && (plan.trialDays ?? 0) > 0 ? (
              <Badge className="h-5 px-2 text-[11px] bg-green-600 text-white hover:bg-green-600">
                Enabled
              </Badge>
            ) : (
              <Badge variant="outline" className="h-5 px-2 text-[11px]">
                Off
              </Badge>
            )}
          </div>

          <div className="text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
            <span>
              Wishes: <LimitValue v={plan.limits?.wishesLimit} />
            </span>
            <span>
              Habits: <LimitValue v={plan.limits?.habitsLimit} />
            </span>
          </div>
        </div>

        {/* Stripe */}
        <div className="rounded-md border px-3 py-2 space-y-1">
          <div className="text-xs font-medium">Stripe</div>
          <div className="text-[11px] text-muted-foreground break-all">
            Monthly:{" "}
            <span className="font-medium text-foreground">
              {plan.stripeMonthlyPriceId || "Not set"}
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground break-all">
            Yearly:{" "}
            <span className="font-medium text-foreground">
              {plan.stripeYearlyPriceId || "Not set"}
            </span>
          </div>
        </div>

        {/* Features */}
        <div className="rounded-md border px-3 py-2 space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium">Features</div>
            <Badge variant="outline" className="h-5 px-2 text-[11px]">
              {features.length}
            </Badge>
          </div>

          {features.length === 0 ? (
            <p className="text-[11px] text-muted-foreground italic">No features set</p>
          ) : (
            <TooltipProvider>
              <ul className="space-y-1.5">
                {features.map((f, idx) => (
                  <li key={idx} className="text-[11px] text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground/60 shrink-0" />
                      {f.tooltip ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-pointer border-b border-dashed border-muted-foreground/40">
                              {f.text}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs text-sm">{f.tooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <span>{f.text}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </TooltipProvider>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
