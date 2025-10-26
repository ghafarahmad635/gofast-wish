import { db } from "@/lib/prisma"
import { baseProcedure, createTRPCRouter } from "@/trpc/init"
import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { sendEmail } from "@/lib/email"
import { WelcomeEmail } from "@/components/emails-templates/WelcomeEmail"

export const authRouter = createTRPCRouter({
  // ✅ Send welcome email after OTP verification
  sendWelcomeEmail: baseProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const { email } = input

      // Optional: confirm user exists
      const user = await db.user.findUnique({ where: { email } })
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found.",
        })
      }

      // ✅ Send welcome email
      await sendEmail({
        to: email,
        subject: "Welcome to GoFast Wish 🎉",
        react: WelcomeEmail({ name: user.name ?? email.split("@")[0] }),
      })

      console.log(`📧 Welcome email sent successfully to ${email}`)
      return { success: true }
    }),
})
