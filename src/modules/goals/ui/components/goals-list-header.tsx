"use client";
import { PlusIcon, XCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewGoalDialog } from "./new-goal-dialog";
import { useState } from "react";
export const GoalsListHeader = () => {
     const [isDialogOpen, setIsDialogOpen] = useState(false);

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
        
      </div>
    </>
  );
};
