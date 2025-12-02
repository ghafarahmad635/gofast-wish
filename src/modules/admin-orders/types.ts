import { AppRouter } from "@/trpc/routers/_app.ts";
import { inferRouterOutputs } from "@trpc/server";
export type GetManyOrder =
  inferRouterOutputs<AppRouter>["adminOrders"]["getMany"]["items"];
export type OrderRow = GetManyOrder[number];