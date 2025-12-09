import { z } from "zod";

export const goalCategoryInsertSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(191, "Name is too long"),
  description: z
    .string()
    .max(1000, "Description is too long")
    .optional(), // optional + nullable, no transform
});

export type GoalCategoryInsertSchema = z.infer<
  typeof goalCategoryInsertSchema
>;
