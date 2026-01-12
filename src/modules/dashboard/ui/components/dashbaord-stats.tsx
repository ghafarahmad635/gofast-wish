// Snippet Title: DashboardStats usage bars for Goals and Habits (based on billing.getUsage)

"use client";

import Link from "next/link";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { RocketIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const pct = (used: number, limit: number | null) => {
  if (limit === null) return 0; // unlimited: keep bar empty (or you can set to 100 if you prefer)
  if (limit <= 0) return 0;
  return Math.min(100, Math.max(0, (used / limit) * 100));
};

const formatLimit = (limit: number | null) => (limit === null ? "Unlimited" : String(limit));

const DashboardStats = () => {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.billing.getUsage.queryOptions());

  if (!data) return null;

  const goalsUsed = data.goals.used;
  const goalsLimit = data.goals.limit; // number | null
  const habitsUsed = data.habits.used;
  const habitsLimit = data.habits.limit; // number | null

  return (
    <div className="border border-border/10 rounded-lg w-full bg-white/5 flex flex-col gap-y-2">
      <div className="p-3 flex flex-col gap-y-4">
        <div className="flex items-center gap-2">
          <RocketIcon className="size-4" />
          <p className="text-sm font-medium">
            Your Plan: {data.planKey.toUpperCase()}
          </p>
        </div>

        {/* Goals */}
        <div className="flex flex-col gap-y-2">
          <p className="text-xs">
            {goalsUsed}/{formatLimit(goalsLimit)} Goals
            {data.goals.left !== null ? (
              <span className="opacity-70"> · {data.goals.left} left</span>
            ) : (
              <span className="opacity-70"> · No limit</span>
            )}
          </p>
          <Progress value={pct(goalsUsed, goalsLimit)} />
        </div>

        {/* Habits */}
        <div className="flex flex-col gap-y-2">
          <p className="text-xs">
            {habitsUsed}/{formatLimit(habitsLimit)} Habits
            {data.habits.left !== null ? (
              <span className="opacity-70"> · {data.habits.left} left</span>
            ) : (
              <span className="opacity-70"> · No limit</span>
            )}
          </p>
          <Progress value={pct(habitsUsed, habitsLimit)} />
        </div>
      </div>

     
    </div>
  );
};

export default DashboardStats;
