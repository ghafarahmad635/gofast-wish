'use client'

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertTitle } from "@/components/ui/alert"
import { useRouter } from "next/navigation"

import { useTRPC } from "@/trpc/client"
import { useMutation } from "@tanstack/react-query"
import { authClient } from "@/lib/auth-client.ts"

export default function VerifyOtpView({ email }: { email: string }) {
  const [otp, setOtp] = useState("")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const trpc = useTRPC()

  // ✅ Setup tRPC mutation
  const welcomeEmail = useMutation(
    trpc.auth.sendWelcomeEmail.mutationOptions({
      onSuccess: () => {
        console.log("✅ Welcome email sent successfully")
      },
      onError: (err) => {
        console.error("❌ Failed to send welcome email", err)
      },
    })
  )

  const verify = async () => {
    setError(null)

    // 1️⃣ Verify OTP through Better Auth
    const { error } = await authClient.emailOtp.verifyEmail({
      email,
      otp,
    })

    // 2️⃣ If verification successful → send welcome email
    if (!error) {
      try {
        await welcomeEmail.mutateAsync({ email })
        router.push("/dashboard")
      } catch (err: any) {
        console.error(err)
        setError("Failed to send welcome email")
      }
    } else {
      setError(error.message || "Invalid code. Please try again.")
    }
  }

  const resend = async () => {
    try {
      await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "email-verification",
      })
      alert("📧 OTP resent successfully.")
    } catch (err) {
      console.error("Resend error:", err)
      alert("Failed to resend OTP.")
    }
  }

  return (
    <div className="max-w-sm mx-auto text-center space-y-4 mt-16">
      <h2 className="text-xl font-bold">Verify your email</h2>
      <p className="text-muted-foreground">Enter the code we sent to {email}</p>

      <Input
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        placeholder="Enter 6-digit code"
        className="text-center tracking-widest"
      />

      <Button className="w-full" onClick={verify}>
        Verify
      </Button>
      <Button variant="link" onClick={resend}>
        Resend Code
      </Button>

      {error && (
        <Alert className="bg-destructive/10 border-none">
          <AlertTitle>{error}</AlertTitle>
        </Alert>
      )}
    </div>
  )
}
