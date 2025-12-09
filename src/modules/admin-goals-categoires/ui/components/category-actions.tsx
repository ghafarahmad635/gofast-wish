"use client";

import React from "react";
import { GoalCategoryRow } from "./goal-category-columns";
import { Pencil, Trash2 } from "lucide-react";

interface Props {
  category: GoalCategoryRow;
  onEdit: () => void;
  onDelete: () => void;
}

const CategoryActions: React.FC<Props> = ({ onEdit, onDelete }) => {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onEdit}
        className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium hover:bg-accent"
      >
        <Pencil className="h-3 w-3" />
        Edit
      </button>

      <button
        type="button"
        onClick={onDelete}
        className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
      >
        <Trash2 className="h-3 w-3" />
        Delete
      </button>
    </div>
  );
};

export default CategoryActions;
