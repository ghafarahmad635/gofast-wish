// src/lib/ai/schemas/bucketListSchema.ts
import { z } from "zod";

export const bucketListSchema = z.object({
  ideas: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      category: z.string(),
    })
  ),
});

export type BucketListIdea = z.infer<typeof bucketListSchema>["ideas"][number];
