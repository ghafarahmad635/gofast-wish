import { nextCookies } from "better-auth/next-js"
import { createAuthClient } from "better-auth/react"
import { adminClient, emailOTPClient, inferAdditionalFields } from "better-auth/client/plugins";
import { stripeClient } from "@better-auth/stripe/client";
import { auth } from "./auth";
import { ac, superadmin } from "./permissions";
export const authClient = createAuthClient({
    baseURL: process.env.BETTER_AUTH_URL, // The base URL of your auth server
    plugins:[
        inferAdditionalFields<typeof auth>(),
        nextCookies(),
        adminClient({
            ac,
            roles: {  superadmin }
        }),
         emailOTPClient(),
        stripeClient({
        subscription:true
    })]
})