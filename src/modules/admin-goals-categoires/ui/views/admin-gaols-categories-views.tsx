"use client";

import { DataTable } from "@/components/data-table";
import { DataPagination } from "@/components/DataPagination";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import {
  goalCategoryColumnsFactory,
  GoalCategoryRow,
} from "../components/goal-category-columns";
import { useCategoriesAdminFilters } from "../../hooks/use-admin-users";
import UpdateCategoryDialog from "../components/update-category-dialog";
import { useConfirm } from "@/hooks/use-confirm";
import { toast } from "sonner";

const AdminGoalsCategoriesViews = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useCategoriesAdminFilters();

  const { data } = useSuspenseQuery(
    trpc.adminGoalsCategories.getMany.queryOptions({ ...filters }),
  );

  const [selectedCategory, setSelectedCategory] =
    useState<GoalCategoryRow | null>(null);
  const [editCategoryModal, setEditCategoryModal] = useState(false);

  const deleteCategory = useMutation(
    trpc.adminGoalsCategories.remove.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const [ConfirmDialog, confirmDelete] = useConfirm(
    "Delete Category",
    "Are you sure you want to delete this category? This action cannot be undone.",
  );

  const handleRemoveCategory = useCallback(
    async (categoryId: string) => {
      await confirmDelete(async () => {
         toast.promise(
          deleteCategory.mutateAsync({ id: categoryId }),
          {
            loading: "Deleting category...",
            success: "Category deleted successfully",
            error: "Failed to delete category",
          },
        );
      });
    },
    [confirmDelete, deleteCategory],
  );

  const columns = useMemo(
    () =>
      goalCategoryColumnsFactory({
        onEdit: (category) => {
          setSelectedCategory(category);
          setEditCategoryModal(true);
        },
        onDelete: handleRemoveCategory,
      }),
    [handleRemoveCategory],
  );

  return (
    <>
      <div className="flex flex-1 grow flex-col gap-y-4 pb-4">
        <DataTable data={data.items} columns={columns} />
        <DataPagination
          page={filters.page}
          totalPages={data.totalPages}
          onPageChange={(page) => setFilters({ page })}
        />
      </div>

      <UpdateCategoryDialog
        category={selectedCategory}
        open={editCategoryModal}
        onOpenChange={setEditCategoryModal}
      />

      <ConfirmDialog />
    </>
  );
};

export default AdminGoalsCategoriesViews;

export const AdminGoalsCategoriesViewsLoadingState = () => {
  return <LoadingState title="" description="" />;
};

export const AdminGoalsCategoriesViewsErrorState = () => {
  return <ErrorState title="" description="" />;
};
