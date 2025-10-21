import { AppRouter } from "@/trpc/routers/_app.ts";
import { inferRouterOutputs } from "@trpc/server";
export type GoalGetOne = inferRouterOutputs<AppRouter>["goals"]["getOne"];