import { AppRouter } from "@/trpc/routers/_app.ts";
import { inferRouterOutputs } from "@trpc/server";
// export type HabitGetOne = inferRouterOutputs<AppRouter>["habitsTracker"]["getOne"];
export type HabitGetMany = inferRouterOutputs<AppRouter>["habitsTracker"]["getMany"];


// server paramas
