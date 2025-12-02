import { AppRouter } from "@/trpc/routers/_app.ts";
import { inferRouterOutputs } from "@trpc/server";
export type GetManyAddons = inferRouterOutputs<AppRouter>["adminAddons"]["getMany"]['items'];
