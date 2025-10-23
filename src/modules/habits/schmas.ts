import { z } from "zod";

export const habitCreateSchema = z.object({
  title: z
    .string()
    .nonempty("Title is required")
    .min(2, "Title must be at least 2 characters long")
    .max(100, "Title too long"),

  description: z
    .string()
    .max(500, "Description too long")
    .optional(),

  frequency: z.enum(["daily", "weekly", "monthly"]).refine(
    (val) => ["daily", "weekly", "monthly"].includes(val),
    {
      message: "Frequency must be either 'daily', 'weekly', or 'monthly'",
    }
  ),

  startDate: z.union([z.string(), z.date()]).optional(),
});

export type HabitCreateSchema = z.infer<typeof habitCreateSchema>;
