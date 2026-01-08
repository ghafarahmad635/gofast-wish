import { AppRouter } from "@/trpc/routers/_app.ts";
import { inferRouterOutputs } from "@trpc/server";
export type PlanGetOne = inferRouterOutputs<AppRouter>["adminPlansRouter"]["list"][0];
export type PlanGetAll = inferRouterOutputs<AppRouter>["adminPlansRouter"]["list"];