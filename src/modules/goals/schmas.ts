import { z } from "zod";

export const goalInsertSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  targetDate: z.string().optional(), // ✅ keep as string
  priority: z.enum(["1", "2", "3"]).optional(),
});

export type GoalInsertSchema = z.infer<typeof goalInsertSchema>;
