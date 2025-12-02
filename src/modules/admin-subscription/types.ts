import { AppRouter } from "@/trpc/routers/_app.ts";
import { inferRouterOutputs } from "@trpc/server";
export type GetManySubscription =
  inferRouterOutputs<AppRouter>["adminSubscriptions"]["getMany"]["items"];
export enum UserBanStatus {
  NotBanned = "not_banned",
  Banned = "banned",
 
};
// Subscription plan
export enum SubscriptionPlan {
  STANDARD = "standard",
  PRO = "pro",
}

// Subscription status
export enum SubscriptionStatus {
  INCOMPLETE = "incomplete",
  ACTIVE = "active",
}
