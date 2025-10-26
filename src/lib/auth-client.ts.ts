import { nextCookies } from "better-auth/next-js"
import { createAuthClient } from "better-auth/react"
import { adminClient, emailOTPClient } from "better-auth/client/plugins";
import { stripeClient } from "@better-auth/stripe/client";
export const authClient = createAuthClient({
    baseURL: process.env.BETTER_AUTH_URL, // The base URL of your auth server
    plugins:[
        nextCookies(),
        adminClient(),
         emailOTPClient(),
        stripeClient({
        subscription:true
    })]
})