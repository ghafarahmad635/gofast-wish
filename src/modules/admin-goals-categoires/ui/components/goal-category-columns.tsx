"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { FolderTree, Tag } from "lucide-react";

import { GetManyGoalCategories } from "../../types";
import CategoryActions from "./category-actions";



export type GoalCategoryRow = GetManyGoalCategories[number];

type CategoryColumnsFactoryArgs = {
  onEdit: (category: GoalCategoryRow) => void;
  onDelete: (categoryId: string) => void; 
};

export function goalCategoryColumnsFactory({
  onEdit,
  onDelete,
}: CategoryColumnsFactoryArgs): ColumnDef<GoalCategoryRow>[] {
  return [
    {
      accessorKey: "name",
      header: "Category",
      cell: ({ row }) => {
        const category = row.original;

        return (
          <div className="flex flex-col">
            <span className="font-semibold flex items-center gap-1">
              <FolderTree className="w-4 h-4 text-muted-foreground" />
              {category.name}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {category.slug}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const description = row.original.description;

        if (!description) {
          return (
            <span className="text-xs text-muted-foreground">
              No description
            </span>
          );
        }

        return (
          <span className="text-xs text-muted-foreground line-clamp-2">
            {description}
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        const createdAt = row.original.createdAt
          ? new Date(row.original.createdAt)
          : null;

        return (
          <span className="text-xs text-muted-foreground">
            {createdAt ? format(createdAt, "MMM d, yyyy") : "Unknown"}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      enableHiding: false,
      cell: ({ row }) => {
        const category = row.original;

        return (
          <div className="flex justify-center">
            <CategoryActions
              category={category}
              onEdit={() => onEdit(category)}   
              onDelete={()=>onDelete(category.id)}     
              
            />
          </div>
        );
      },
    },
  ];
}
