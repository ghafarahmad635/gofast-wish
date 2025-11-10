// src/lib/ai/schemas/bucketListSchema.ts
import { z } from "zod";

export const bucketListIdeaGeneratedSchema = z.object({
  ideas: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      category: z.string(),
    })
  ),
});

// single idea for array streaming
export const bucketListIdeaItem = z.object({
  title: z.string(),
  description: z.string(),
  category: z.string(),
});

export type BucketListIdea = z.infer<typeof bucketListIdeaItem>;
