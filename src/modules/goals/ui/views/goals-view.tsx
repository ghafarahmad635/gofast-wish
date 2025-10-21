"use client";

import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Check } from "lucide-react";
import { format } from "date-fns";
import { DataPagination } from "../components/data-pagination";
import { useGoalsFilters } from "../../hooks/use-goals-filters";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import GoalForm from "../components/goal-form";
import { useEffect } from "react";

const GoalsViews = () => {
  const trpc = useTRPC();
  const [filters, setFilters] = useGoalsFilters();
  const { data } = useSuspenseQuery(trpc.goals.getMany.queryOptions({
    search:filters.search,
    page:filters.page,
    
  }));
 
  const goalDetails = data.items.find((g) => g.id === filters.edit) ?? null;

  // ✅ If user manually edits URL or invalid ID, auto-close dialog
  useEffect(() => {
    if (filters.edit && !goalDetails) {
      console.warn("Invalid goal ID in edit param — closing dialog");
      setFilters({ edit: "" }); // close modal and clear invalid ID
    }
  }, [filters.edit, goalDetails, setFilters]);

 // ✅ Helper function for closing dialog
  const closeDialog = () => setFilters({ edit: "" });

  if (!data || data.items.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <EmptyState
          title="No goals yet"
          description="Start by creating your first goal to stay focused and track progress."
        />
      </div>
    );
  }

  return (
    <>
    <div className="flex-1 pb-6 px-4 md:px-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data.items.map((goal) => {
          const targetDate = goal.targetDate
            ? format(new Date(goal.targetDate), "MMM d, yyyy")
            : null;

          return (
            <Card
              key={goal.id}
              className="group relative gap-0 overflow-hidden border border-gray-200 shadow-sm 
                         hover:shadow-lg hover:border-primary hover:scale-[1.02] hover:translate-y-[-8px]
                         transition-all duration-300 bg-white/80 backdrop-blur-sm p-0 pb-4 transform"
            >
              {/* Image */}
              {goal.featuredImage?.url ? (
                <div className="relative w-full aspect-[16/9] m-0 overflow-hidden">
                  <Image
                    src={goal.featuredImage.url}
                    alt={goal.title}
                    fill
                    className="object-cover rounded-t-md transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-t-md" />
                </div>
              ) : (
                <div className="relative flex items-center justify-center w-full aspect-[16/9] bg-gray-100 text-gray-500 text-sm rounded-t-md overflow-hidden">
                  No Image
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-t-md" />
                </div>
              )}

              {/* Header */}
              <CardHeader className="flex flex-row justify-between items-start px-4 py-0 mt-4 mb-3">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-semibold truncate transition-colors duration-300 group-hover:text-primary">
                    {goal.title}
                  </CardTitle>
                </div>

                <div className="flex gap-2 ml-2 shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-gray-600 hover:text-primary"
                     onClick={() => setFilters({ edit: goal.id })}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-gray-600 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              {/* Body */}
              <CardContent className="text-sm text-gray-600 px-4 py-0">
                <p className="line-clamp-2">{goal.description}</p>

                <div className="mt-3 flex justify-between items-center text-xs text-gray-500">
                  <span className="capitalize">
                    {goal.category || "Uncategorized"}
                  </span>
                  {goal.priority && (
                    <span
                      className={`font-medium ${
                        goal.priority === 1
                          ? "text-red-500"
                          : goal.priority === 2
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {goal.priority === 1
                        ? "High"
                        : goal.priority === 2
                        ? "Medium"
                        : "Low"}
                    </span>
                  )}
                </div>

                {/* Target Date */}
                {targetDate && (
                  <div className="mt-2 text-xs text-gray-500">
                    Target Date:{" "}
                    <span className="font-medium text-gray-700">
                      {targetDate}
                    </span>
                  </div>
                )}

                {/* Completion Button */}
                <div className="mt-4 flex justify-end">
                  {goal.isCompleted ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 border-green-400 hover:bg-green-50 flex items-center gap-1"
                    >
                      <Check className="w-4 h-4" />
                      Completed
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-gray-700 hover:bg-primary hover:text-white flex items-center gap-1"
                    >
                      <Check className="w-4 h-4" />
                      Mark Complete
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <DataPagination
        page={filters.page}
        totalPages={data.totalPages}
        onPageChange={(page) => setFilters({ page })}
       />
    </div>
    <ResponsiveDialog
      title="Edit Goal"
      description="Update your goal details below."
      open={!!filters.edit}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setFilters({ edit: "" });
        } // ✅ closes modal + clears URL
      }}
    >
      <GoalForm 
       onSuccess={closeDialog}
       onCancel={closeDialog}
      initialValues={goalDetails} />
    </ResponsiveDialog>

    </>

  );
};

export default GoalsViews;

export const GoalsViewLoadingState = () => (
  <LoadingState
    title="Loading Goals"
    description="Please wait while we fetch your goals."
  />
);

export const GoalsViewErrorState = () => (
  <ErrorState
    title="Error Loading Goals"
    description="There was an error fetching your goals."
  />
);
