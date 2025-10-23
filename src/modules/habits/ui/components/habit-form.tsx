"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { habitCreateSchema, HabitCreateSchema } from "../../schmas";
import { DatePickerField } from "./date-picker-field";
import { toast } from "sonner";

interface HabitFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  // initialValues?: HabitGetOne; // you can add later for edit mode
}

const HabitForm = ({ onSuccess, onCancel }: HabitFormProps) => {
  const trpc = useTRPC();
 const queryClient = useQueryClient();
  // form setup
  const form = useForm<HabitCreateSchema>({
    resolver: zodResolver(habitCreateSchema),
    defaultValues: {
      title: "",
      description: "",
      frequency: "daily",
      startDate: new Date().toISOString().split("T")[0],
    },
  });

 const createHabit = useMutation(
    trpc.habitsTracker.create.mutationOptions({
      onSuccess: async (data) => {
        await queryClient.invalidateQueries(trpc.habitsTracker.getMany.queryOptions())
        form.reset();
        onSuccess?.();

        // Data will contain { success, message, habit }
        toast.success(data?.message || "Habit created successfully!", {
          description: "Your new habit has been added to your tracker.",
        });
      },

      onError: (err) => {
        console.error("Error creating habit:", err);

        // Safely check if backend included a message
        const message =
          err.message ||
          "Unable to create habit. Please try again or contact support.";

        // Show toast message
        toast.error("Error creating habit", {
          description: message,
        });
      },
    })
  );



  const isPending = createHabit.isPending;

  // handle submit
  const onSubmit = (values: HabitCreateSchema) => {
    createHabit.mutate(values);
  };

  // UI
  return (
    <Form {...form}>
      <form
        className="space-y-6 "
        onSubmit={form.handleSubmit(onSubmit)}
      >
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
                
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="bg-white w-full">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent className="w-full ">
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
            {isPending ? "Saving..." : "Save Habit"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default HabitForm;
