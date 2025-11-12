import { z } from "zod";

export const goalInsertSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  targetDate: z.string().optional(),
  priority: z.enum(["1", "2", "3"]).optional(),
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 2 * 1024 * 1024, "Max file size is 2MB")
    .refine(
      (file) =>
        ["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(file.type),
      "Only .jpg, .jpeg, .png, and .webp formats are supported"
    )
    .optional(), // ✅ only used client-side
  featuredImageId: z.string().optional(), // ✅ server-side linkage
});

export type GoalInsertSchema = z.infer<typeof goalInsertSchema>;

export const goalUpdateSchema = goalInsertSchema.extend({
  id: z.string().min(1, { message: "Id is required" }),
});

