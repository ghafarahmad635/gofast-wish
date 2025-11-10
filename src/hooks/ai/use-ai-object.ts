
"use client";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import type { z } from "zod";

type BaseParams<S extends z.ZodTypeAny> = {
  api: string;
  schema: S;
  initialValue?: z.infer<S>; // add this line
};

export function useAiObject<S extends z.ZodTypeAny>(params: BaseParams<S>) {
  return useObject({
   
    api: params.api,
    schema: params.schema,
    initialValue: params.initialValue,
    credentials: "include",
  });
}
