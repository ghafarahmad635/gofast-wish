import { AppRouter } from "@/trpc/routers/_app.ts";
import { inferRouterOutputs } from "@trpc/server";
export type GetManyGoalCategories = inferRouterOutputs<AppRouter>["adminGoalsCategories"]["getMany"]['items'];
export type GoalCategoryGetOne = inferRouterOutputs<AppRouter>["adminGoalsCategories"]["getOne"];