"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { habitCreateSchema, HabitCreateSchema } from "../../schmas";
import { DatePickerField } from "./date-picker-field";
import { toast } from "sonner";
import { HabitGetOne } from "../../types";

interface HabitFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialValues?: HabitGetOne;
}

const HabitForm = ({ onSuccess, onCancel, initialValues }: HabitFormProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // ✅ setup form with strong default values
  const form = useForm<HabitCreateSchema>({
    resolver: zodResolver(habitCreateSchema),
    defaultValues: {
      title: initialValues?.title || "",
      description: initialValues?.description || "",
      frequency:
        (initialValues?.frequency as "daily" | "weekly" | "monthly") || "daily",
      startDate: initialValues?.startDate
        ? new Date(initialValues.startDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
    },
  });

  // ✅ re-fill when editing different habit
  useEffect(() => {
    if (initialValues) {
      form.reset({
        title: initialValues.title || "",
        description: initialValues.description || "",
        frequency:
          (initialValues.frequency as "daily" | "weekly" | "monthly") ||
          "daily",
        startDate: initialValues.startDate
          ? new Date(initialValues.startDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
      });
    }
  }, [initialValues, form]);

  // ✅ create mutation
  const createHabit = useMutation(
    trpc.habitsTracker.create.mutationOptions({
      onSuccess: async (data) => {
        await queryClient.invalidateQueries(
          trpc.habitsTracker.getMany.queryOptions({})
        );
        await queryClient.invalidateQueries(
          trpc.habitsTracker.getManyByFrequency.queryOptions({})
        );
        
        form.reset();
        onSuccess?.();
        toast.success(data?.message || "Habit created successfully!", {
          description: "Your new habit has been added to your tracker.",
        });
      },
      onError: (err) => {
        toast.error("Error creating habit", {
          description:
            err.message ||
            "Unable to create habit. Please try again or contact support.",
        });
      },
    })
  );

  // ✅ update mutation
  const updateHabit = useMutation(
    trpc.habitsTracker.update.mutationOptions({
      onSuccess: async (data) => {
        await queryClient.invalidateQueries(
          trpc.habitsTracker.getMany.queryOptions({})
        );
         await queryClient.invalidateQueries(
          trpc.habitsTracker.getManyByFrequency.queryOptions({})
        );
        if (initialValues?.id) {
          await queryClient.invalidateQueries(
            trpc.habitsTracker.getCompletions.queryOptions({
              habitId: initialValues.id,
            })
          );
        }
        onSuccess?.();
        toast.success(data.message || "Habit updated successfully!");
      },
      onError: (err) => {
        toast.error("Error updating habit", {
          description: err.message || "Please try again later.",
        });
      },
    })
  );

  const isPending = createHabit.isPending || updateHabit.isPending;

  // ✅ handle submit
  const onSubmit = (values: HabitCreateSchema) => {
    if (initialValues?.id) {
      updateHabit.mutate({ id: initialValues.id, ...values });
    } else {
      createHabit.mutate(values);
    }
  };

  // ✅ UI
  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        {/* Title */}
        <FormField
          name="title"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Habit Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. Morning Exercise" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          name="description"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={3}
                  className="w-full bg-white"
                  placeholder="Describe your habit (optional)"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Frequency */}
        <FormField
          name="frequency"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Frequency</FormLabel>
              <FormControl>
                <Select
                  onValueChange={(val) =>
                    field.onChange(
                      val as "daily" | "weekly" | "monthly" | undefined
                    )
                  }
                  value={field.value}
                >
                  <SelectTrigger className="bg-white w-full">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Start Date */}
        <FormField
          name="startDate"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date</FormLabel>
              <FormControl>
                <DatePickerField
                  value={field.value ? new Date(field.value) : undefined}
                  onChange={(date) => field.onChange(date)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? "Saving..."
              : initialValues
              ? "Update Habit"
              : "Save Habit"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default HabitForm;
