
"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import { z } from "zod";
import { bucketListIdeaItem } from "@/lib/ai/schemas/bucketListSchema";

const ideasArraySchema = z.array(bucketListIdeaItem);

export function useBucketIdeas() {
  const stream = useObject({
    api: "/api/bucket-list/stream",
    schema: ideasArraySchema,
  });

  return stream;
}
