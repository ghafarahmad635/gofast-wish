"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";

const GoalsCompletedHeader = () => {
  const trpc = useTRPC();

  // ✅ Fetch total completed goals
  const { data, isPending, isError } = useQuery(
    trpc.goals.getManyByStatus.queryOptions({ status: "completed" })
  );

  const completedCount = data?.total ?? 0;

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-md">
          <CheckCircle2 size={26} />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Completed Goals
          </h1>

          {/* ✅ Smooth loading shimmer for count */}
          {isPending ? (
            <div className="h-4 w-32 bg-white dark:bg-gray-700 rounded animate-pulse mt-1" />
          ) : isError ? (
            <p className="text-red-500 text-sm mt-1">Failed to load goals</p>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              {completedCount > 0
                ? `${completedCount} goal${completedCount > 1 ? "s" : ""} completed`
                : "No completed goals yet — keep pushing!"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoalsCompletedHeader;
