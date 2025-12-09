"use client";

import { ResponsiveDialog } from "@/components/responsive-dialog";
import React from "react";
import CategoryForm from "./category-form";
import { GoalCategoryRow } from "./goal-category-columns";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: GoalCategoryRow | null;
}

const UpdateCategoryDialog = ({ open, onOpenChange, category }: Props) => {
  const isEditing = !!category; // true when a category is selected

  return (
    <ResponsiveDialog
      title={isEditing ? "Update Category" : "No category selected"}
      description={
        isEditing
          ? `Update ${category.name}`
          : "Select a category to edit."
      }
      open={open}
      onOpenChange={onOpenChange}
    >
      {isEditing ? (
        <CategoryForm
          
          initialValues={category}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          No category selected.
        </p>
      )}
    </ResponsiveDialog>
  );
};

export default UpdateCategoryDialog;
