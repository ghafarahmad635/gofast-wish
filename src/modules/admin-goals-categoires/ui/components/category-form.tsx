"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  GoalCategoryInsertSchema,
  goalCategoryInsertSchema,
} from "../../schmas";
import { GoalCategoryGetOne } from "../../types";

interface CategoryFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialValues?: GoalCategoryGetOne;
}

// We still use this internally when sending data to backend
const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

const CategoryForm = ({
  onSuccess,
  onCancel,
  initialValues,
}: CategoryFormProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [isSubmittingState, setIsSubmittingState] = useState(false);

  const isEdit = !!initialValues?.id;

  const form = useForm<GoalCategoryInsertSchema>({
    resolver: zodResolver(goalCategoryInsertSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      description: initialValues?.description ?? "",
    },
  });

  const createCategory = useMutation(
    trpc.adminGoalsCategories.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.adminGoalsCategories.getMany.queryOptions({}),
        );
        toast.success("Category created successfully!");
        onSuccess?.();
        form.reset();
      },
      onError: (error) => toast.error(error.message),
    }),
  );

  const updateCategory = useMutation(
    trpc.adminGoalsCategories.update.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.adminGoalsCategories.getMany.queryOptions({}),
        );
        toast.success("Category updated successfully!");
        onSuccess?.();
        form.reset();
      },
      onError: (error) => toast.error(error.message),
    }),
  );

  const isPending = createCategory.isPending || updateCategory.isPending;
  const isSubmitting = isPending || isSubmittingState;

  const onSubmit = async (values: GoalCategoryInsertSchema) => {
    try {
      setIsSubmittingState(true);

      const payload = {
        name: values.name,
        description: values.description,
        // if your backend still uses slug, we generate it here
        slug: slugify(values.name),
      };

      if (isEdit && initialValues?.id) {
        updateCategory.mutate({ ...payload, id: initialValues.id });
      } else {
        createCategory.mutate(payload);
      }
    } catch (error: any) {
      console.error("❌ Failed to submit category:", error);
      toast.error(
        error?.message || "Something went wrong while saving the category",
      );
    } finally {
      setIsSubmittingState(false);
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g. Health, Career, Learning..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="description"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  className="bg-white"
                  placeholder="Short description of this category..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3 justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? isEdit
                ? "Updating..."
                : "Saving..."
              : isEdit
              ? "Update Category"
              : "Save Category"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CategoryForm;
