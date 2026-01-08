"use client";

import * as React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { PlanGetOne } from "../../types";
import { PlanUpdateSchema, planUpdateSchema } from "../../schema";
import { dollarsFromCents } from "../../utils";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, ChevronDown, ChevronRight } from "lucide-react";

interface Props {
  plan: PlanGetOne;
  onSaved: () => void;
  onCancel: () => void;
}

const PlanEditForm = ({ plan, onSaved, onCancel }: Props) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const updatePlan = useMutation(
    trpc.adminPlansRouter.update.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.adminPlansRouter.list.queryOptions());
        await queryClient.invalidateQueries(trpc.billing.getPlans.queryOptions());
        toast.success("Plan updated successfully");
        onSaved();
      },
      onError: (error) => {
        toast.error("Error updating plan: " + error.message);
      },
    })
  );

  const isPending = updatePlan.isPending;

  const form = useForm({
    resolver: zodResolver(planUpdateSchema),
    defaultValues: {
      id: plan.id,
      name: plan.name ?? "",
      description: plan.description ?? "",
      monthlyPriceUsd: dollarsFromCents(plan.monthlyPrice),
      yearlyPriceUsd: dollarsFromCents(plan.yearlyPrice),
      trialDays: plan.trialDays ?? 0,
      isActive: Boolean((plan as any).isActive ?? (plan as any).active ?? true),
      highlighted: Boolean(plan.highlighted),
      stripeMonthlyPriceId: plan.stripeMonthlyPriceId ?? "",
      stripeYearlyPriceId: plan.stripeYearlyPriceId ?? "",
      wishesLimit: plan.limits?.wishesLimit == null ? "" : String(plan.limits.wishesLimit),
      habitsLimit: plan.limits?.habitsLimit == null ? "" : String(plan.limits.habitsLimit),
      features: (plan.features ?? []).map((f) => ({
        text: f.text ?? "",
        tooltip: f.tooltip ?? "",
      })),
    },
  });

  const featuresArray = useFieldArray({
    control: form.control,
    name: "features",
  });

  const onSubmit = (values: PlanUpdateSchema) => updatePlan.mutate(values);

  const [showStripeIds, setShowStripeIds] = React.useState<boolean>(false);
  const [showFeatures, setShowFeatures] = React.useState<boolean>(
    (plan.features?.length ?? 0) > 0
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <fieldset disabled={isPending} className="space-y-4">
          <div className="grid gap-4">
            {/* Core */}
            <div className="grid gap-4 rounded-lg border p-4">
              <div className="text-sm font-semibold">Plan details</div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Pro" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} placeholder="Short plan description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Pricing */}
            <div className="grid gap-4 rounded-lg border p-4">
              <div className="text-sm font-semibold">Pricing</div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="monthlyPriceUsd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly price (USD)</FormLabel>
                      <FormControl>
                        <Input {...field} inputMode="decimal" placeholder="9.99" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="yearlyPriceUsd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Yearly price (USD)</FormLabel>
                      <FormControl>
                        <Input {...field} inputMode="decimal" placeholder="99.99" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="trialDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trial days</FormLabel>
                      <FormControl>
                        <Input
                          inputMode="numeric"
                          value={String(field.value ?? 0)}
                          onChange={(e) => field.onChange(Number(e.target.value || 0))}
                          placeholder="0"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="rounded-md border p-3">
                  <div className="text-xs font-medium">Note</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Prices here are app displayed values. Billing is controlled by Stripe Price IDs.
                  </div>
                </div>
              </div>

              {/* Stripe Price IDs toggle */}
              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <div className="text-sm font-medium">Stripe Price IDs</div>
                  <div className="text-xs text-muted-foreground">
                    Advanced. Change only if you created new Prices in Stripe.
                  </div>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowStripeIds((v) => !v)}
                >
                  {showStripeIds ? (
                    <>
                      <ChevronDown className="mr-2 h-4 w-4" />
                      Hide
                    </>
                  ) : (
                    <>
                      <ChevronRight className="mr-2 h-4 w-4" />
                      Edit
                    </>
                  )}
                </Button>
              </div>

              {showStripeIds && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="stripeMonthlyPriceId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stripe monthly price ID</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="price_..." />
                        </FormControl>
                        <div className="text-xs text-muted-foreground">
                          Stripe Price ID for monthly billing.
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stripeYearlyPriceId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stripe yearly price ID</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="price_..." />
                        </FormControl>
                        <div className="text-xs text-muted-foreground">
                          Stripe Price ID for yearly billing.
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            {/* Status */}
            <div className="grid gap-3 rounded-lg border p-4">
              <div className="text-sm font-semibold">Status</div>

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <FormLabel className="text-sm font-medium">Active</FormLabel>
                      <div className="text-xs text-muted-foreground">
                        Users can select this plan
                      </div>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="highlighted"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <FormLabel className="text-sm font-medium">Highlighted</FormLabel>
                      <div className="text-xs text-muted-foreground">Shows Highlight badge</div>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            {/* Limits */}
            <div className="grid gap-4 rounded-lg border p-4">
              <div>
                <div className="text-sm font-semibold">Limits</div>
                <div className="text-xs text-muted-foreground">
                  Set how many items users can create on this plan. Leave blank for unlimited.
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="wishesLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wishes limit (goals)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          inputMode="numeric"
                          placeholder="e.g. 25 (blank = unlimited)"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <div className="text-xs text-muted-foreground">
                        Total wishes a user can create on this plan.
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="habitsLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Habits limit</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          inputMode="numeric"
                          placeholder="e.g. 10 (blank = unlimited)"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <div className="text-xs text-muted-foreground">
                        Total habits a user can create on this plan.
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="rounded-md border p-3">
                <div className="text-xs font-medium">Tip</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Use blank for unlimited. Use 0 only if you want to disable creating that item type.
                </div>
              </div>
            </div>


            {/* Features */}
            <div className="grid gap-4 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">Features</div>
                  <div className="text-xs text-muted-foreground">
                    These appear on the pricing page.
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowFeatures((v) => !v)}
                  >
                    {showFeatures ? (
                      <>
                        <ChevronDown className="mr-2 h-4 w-4" />
                        Collapse
                      </>
                    ) : (
                      <>
                        <ChevronRight className="mr-2 h-4 w-4" />
                        Expand
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!showFeatures || isPending}
                    onClick={() => featuresArray.append({ text: "", tooltip: "" })}
                  >
                    Add
                  </Button>
                </div>
              </div>

              {showFeatures && (
                <div className="space-y-3">
                  {featuresArray.fields.length === 0 ? (
                    <div className="rounded-md border p-3 text-sm text-muted-foreground">
                      No features yet. Click Add to create one.
                    </div>
                  ) : (
                    featuresArray.fields.map((item, index) => (
                      <div key={item.id} className="rounded-md border p-3 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-muted-foreground">
                            Feature {index + 1}
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={isPending}
                            onClick={() => featuresArray.remove(index)}
                          >
                            Remove
                          </Button>
                        </div>

                        <FormField
                          control={form.control}
                          name={`features.${index}.text`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Text</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Feature text" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`features.${index}.tooltip`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tooltip (optional)</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Tooltip text" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>

              <Button type="button" variant="secondary" disabled={isPending} onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </div>
        </fieldset>
      </form>
    </Form>
  );
};

export default PlanEditForm;
