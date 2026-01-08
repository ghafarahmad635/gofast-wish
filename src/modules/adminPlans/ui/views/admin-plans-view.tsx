"use client";

import  { useState } from "react";
import { ErrorState } from "@/components/error-state";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PlanGetOne } from "../../types";
import { PlanCard } from "../components/plan-card";
import UpdatePlanDialog from "../components/update-plan-dialog";




export default function AdminPlansView() {
  const trpc = useTRPC();
   const [editPlanModal, setEditPlanModal] = useState(false);
   const [selectedPlan, setSelectedPlan] = useState<PlanGetOne | null>(null);

  const { data: plans } = useSuspenseQuery(
    trpc.adminPlansRouter.list.queryOptions()
  );

  if (!plans || plans.length === 0) {
    return (
      <div className="p-6">
        <ErrorState
          title="No plans found"
          description="Seed plans first, then refresh this page."
        />
      </div>
    );
  }

  return (
    <>
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Plans</h1>
        <p className="text-sm text-muted-foreground">
          Manage pricing, trial, limits, and features for each plan.
        </p>
      </div>

       <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {(plans).map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onEdit={(p) => {
                setSelectedPlan(p);
                setEditPlanModal(true);
              }}
            />
          ))}
        </div>
    </div>
    <UpdatePlanDialog 
     open={editPlanModal}
         onOpenChange={(open) => {
          setEditPlanModal(open);
          // if (!open) setSelectedPlan(null);
        }}
        plan={selectedPlan}
    />
    </>
  );
}

export const AdminPlansViewLoadingState = () => {
  return (
    <div className="p-6 space-y-4">
      <div className="space-y-2">
        <div className="h-6 w-40 rounded bg-muted animate-pulse" />
        <div className="h-4 w-72 rounded bg-muted animate-pulse" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <div className="h-5 w-36 rounded  bg-gray-300/50 animate-pulse" />
              </div>
              <div className="h-9 w-16 rounded bg-gray-300/50  animate-pulse" />
            </div>

            <div className="h-4 w-full rounded bg-gray-300/50 animate-pulse" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-16 rounded bg-gray-300/50 animate-pulse" />
              <div className="h-16 rounded bg-gray-300/50 animate-pulse" />
            </div>

            <div className="h-16 rounded bg-gray-300/50 animate-pulse" />
            <div className="h-24 rounded bg-gray-300/50 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const AdminPlansViewErrorState = () => {
  return (
    <div className="p-6">
      <ErrorState
        title="Failed to load plans"
        description="Please refresh the page."
      />
    </div>
  );
};
