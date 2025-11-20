import { AppRouter } from "@/trpc/routers/_app.ts";
import { inferRouterOutputs } from "@trpc/server";
export type GetManyUser = inferRouterOutputs<AppRouter>["adminUsers"]["getMany"]['items'];
export enum UserBanStatus {
  NotBanned = "not_banned",
  Banned = "banned",
 
};
export enum UserRole {
  User = "USER",
  SuperAdmin = "SUPERADMIN",
 
};


export enum UserLoginStatus {
  Online = "online",
  Offline = "offline",
}

export enum UserEmailStatus {
  Verified = "verified",
  NotVerified = "not_verified",
}