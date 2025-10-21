"use client";
import { PlusIcon, XCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewGoalDialog } from "./new-goal-dialog";
import { useState } from "react";
import { useGoalsFilters } from "../../hooks/use-goals-filters";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { GoalsSearchFilter } from "./agents-search-filter";
import { DEFAULT_PAGE } from "@/constants";
export const GoalsListHeader = () => {
     const [isDialogOpen, setIsDialogOpen] = useState(false);
     const [filters, setFilters] = useGoalsFilters();
       const isAnyFilterModified = !!filters.search;
       const onClearFilters = () => {
      setFilters({
        search: "",
        page: DEFAULT_PAGE,
      });
    }

  return (
    <>
      <NewGoalDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      <div className="py-4 px-4 md:px-8 flex flex-col gap-y-4">
        <div className="flex items-center justify-between">
          <h5 className="font-medium text-xl">My Goals</h5>
          <Button onClick={() => setIsDialogOpen(true)}>
            <PlusIcon />
            New Goal
          </Button>
        </div>
        <ScrollArea>
          <div className="flex items-center gap-x-2 p-1">
            <GoalsSearchFilter />
            {isAnyFilterModified && (
              <Button variant="outline" size="sm" onClick={onClearFilters}>
                <XCircleIcon />
                Clear
              </Button>
            )}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
     
    </>
  );
};
