import { AppRouter } from "@/trpc/routers/_app.ts";
import { inferRouterOutputs } from "@trpc/server";
export type BillingPlanGetOne = inferRouterOutputs<AppRouter>['billing']["getPlans"][0];
export type BillingPlanGetAll = inferRouterOutputs<AppRouter>['billing']["getPlans"];