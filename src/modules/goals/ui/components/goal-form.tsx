"use client";

import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { GoalInsertSchema, goalInsertSchema } from "../../schmas";
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
import DatePickerField from "./date-picker-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categories } from "../../constants";
import FeaturedImageUpload from "./FeaturedImageUpload";
import { uploadFiles } from "@/lib/utils/uploadthingClient";
import { useState } from "react";
import { GoalGetOne } from "../../types";

interface GoalFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialValues?: GoalGetOne;
}

const GoalForm = ({ onSuccess, onCancel, initialValues }: GoalFormProps) => {
  const trpc = useTRPC();
  const [isUploading, setIsUploading] = useState(false);
  const isEdit = !!initialValues?.id;
  const queryClient = useQueryClient();

  const form = useForm<GoalInsertSchema>({
    resolver: zodResolver(goalInsertSchema),
    defaultValues: {
      title: initialValues?.title ?? "",
      description: initialValues?.description ?? "",
      category: initialValues?.category ?? "",
      targetDate: initialValues?.targetDate
        ? new Date(initialValues.targetDate).toISOString()
        : undefined,
      priority: initialValues?.priority
        ? String(initialValues.priority) as "1" | "2" | "3"
        : undefined,
      featuredImageId: initialValues?.featuredImageId ?? undefined,
    },
  });

  const createGoal = useMutation(
    trpc.goals.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.goals.getMany.queryOptions({}));
        await queryClient.invalidateQueries(trpc.goals.getManyByStatus.queryOptions({}));
        await queryClient.invalidateQueries(trpc.goals.getManyLatestForCarousel.queryOptions({}))
        await queryClient.invalidateQueries(trpc.goals.getAll.queryOptions())
        toast.success("Goal created successfully!");
        onSuccess?.();
        form.reset();
      },
      onError: (error) => toast.error(error.message),
    })
  );

  const updateGoal = useMutation(
    trpc.goals.update.mutationOptions({
      onSuccess: async () => {
        toast.success("Goal updated successfully!");
        await queryClient.invalidateQueries(trpc.goals.getMany.queryOptions({}));
        await queryClient.invalidateQueries(trpc.goals.getManyByStatus.queryOptions({}));
        await queryClient.invalidateQueries(trpc.goals.getManyLatestForCarousel.queryOptions({}))
        await queryClient.invalidateQueries(trpc.goals.getAll.queryOptions())
        onSuccess?.();
        form.reset();
      },
      onError: (error) => toast.error(error.message),
    })
  );

  const isPending = createGoal.isPending || updateGoal.isPending;
  const isSubmitting = isPending || isUploading;

  const onSubmit = async (values: GoalInsertSchema) => {
  try {
    setIsUploading(true);
    let featuredImageId = initialValues?.featuredImageId ?? undefined;

    // Case 1: user picked a new file → upload & replace old
    if (values.file && values.file instanceof File) {
      const uploadRes = await uploadFiles("goalImageUploader", { files: [values.file] });
      const uploaded = uploadRes?.[0];
      if (uploaded?.serverData?.mediaId) {
        featuredImageId = uploaded.serverData.mediaId;
      } else {
        toast.error("Image upload failed");
        setIsUploading(false);
        return;
      }
    }

    // Case 2: user removed image and didn’t upload a new one → delete old
    else if (!values.file && !form.getValues("featuredImageId") && initialValues?.featuredImageId) {
      featuredImageId = undefined; // triggers backend delete
    }

    setIsUploading(false);
    console.log("Featured Image ID:", featuredImageId);

    const payload = {
      title: values.title,
      description: values.description,
      category: values.category,
      targetDate: values.targetDate,
      priority: values.priority,
      featuredImageId, // may be undefined or new ID
    };

    if (isEdit && initialValues?.id) {
      updateGoal.mutate({ ...payload, id: initialValues.id });
    } else {
      createGoal.mutate(payload);
    }
  } catch (error: any) {
    console.error("❌ Failed to submit goal:", error);
    toast.error(error.message || "Something went wrong while saving your goal");
  } finally {
    setIsUploading(false);
  }
};


  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FeaturedImageUpload
          form={form}
          name="file"
          initialImage={initialValues?.featuredImage?.url ?? null}
        />

        <FormField
          name="title"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl><Input {...field} placeholder="e.g. Learn React" /></FormControl>
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
              <FormControl><Textarea  className="bg-white"{...field} placeholder="Short summary..." /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="bg-white w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="targetDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Target Date</FormLabel>
              <DatePickerField field={field} />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="bg-white w-full">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">High</SelectItem>
                  <SelectItem value="2">Medium</SelectItem>
                  <SelectItem value="3">Low</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {isUploading && <p className="text-sm text-gray-500 italic">Uploading image...</p>}

        <div className="flex gap-3 justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (isEdit ? "Updating..." : "Saving...") : isEdit ? "Update Goal" : "Save Goal"}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default GoalForm;
