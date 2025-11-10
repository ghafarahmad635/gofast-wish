// src/lib/lcStructured.ts
import { z } from "zod";
import { openaiModal } from "./langchain";


// Wraps a Zod schema so you get type safe parsed output
export function structuredCaller<T extends z.ZodTypeAny>(schema: T) {
  const structured = openaiModal.withStructuredOutput(schema, {
    name: "structured_output",
    // optional description can be added here
  });
  return structured;
}
