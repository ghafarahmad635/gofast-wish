"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PlusCircle, Target } from "lucide-react";
import { NewGoalDialog } from "@/modules/goals/ui/components/new-goal-dialog";
import { useState } from "react";

const GoalsInCompletedHeader = () => {

  const trpc = useTRPC();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // ✅ Fetch total incomplete goals
  const { data, isPending, isError } = useQuery(
    trpc.goals.getManyByStatus.queryOptions({ status: "incomplete" })
  );

  const goalsToComplete = data?.total ?? 0;

  return (
    <>
    <NewGoalDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white shadow-md">
          <Target size={24} />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Your Goals
          </h1>

          {/* ✅ Smooth loading shimmer for text */}
          {isPending ? (
            <div className="h-4 w-32 bg-white dark:bg-gray-700 rounded animate-pulse mt-1" />
          ) : isError ? (
            <p className="text-red-500 text-sm mt-1">Failed to load goals</p>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              {goalsToComplete > 0
                ? `${goalsToComplete} goal${
                    goalsToComplete > 1 ? "s" : ""
                  } to complete`
                : "All goals completed — great job!"}
            </p>
          )}
        </div>
      </div>

      {/* Right Section */}
      <Button
        className="flex items-center gap-2 bg-primary text-white hover:bg-primary/90 transition-all shadow-sm"
        onClick={()=>setIsDialogOpen(true)}
      >
        <PlusCircle size={18} />
        <span>New Goal</span>
      </Button>
    </div>
    </>
    
  );
};

export default GoalsInCompletedHeader;
