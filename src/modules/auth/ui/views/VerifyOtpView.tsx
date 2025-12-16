'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertTitle } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { useTRPC } from "@/trpc/client"
import { useMutation } from "@tanstack/react-query"

import { Card, CardContent } from "@/components/ui/card"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client.ts"

export default function VerifyOtpView({ email }: { email: string }) {
  const [otp, setOtp] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const router = useRouter()
  const trpc = useTRPC()

  // ✅ TRPC mutation for welcome email
  const welcomeEmail = useMutation(
    trpc.auth.sendWelcomeEmail.mutationOptions({
      onSuccess: () => {
        
      },
      onError: (err) => {
        console.error("❌ Failed to send welcome email:", err)
        toast.error("Failed to send welcome email")
      },
    })
  )

  // ✅ Verify OTP
  const verify = async () => {
    setError(null)
    if (otp.length < 6) {
      toast.error("Please enter a 6-digit code")
      return
    }

    setIsLoading(true)

    await authClient.emailOtp.verifyEmail(
      { email, otp },
      {
        onSuccess: async () => {
          setError(null)
          
          toast.success("✅ You successfully verified your email")
          router.push("/dashboard")
        },
        onError: ({ error }) => {
          console.error("❌ OTP verification failed:", error)
          setError(error.message)
          toast.error("Invalid or expired OTP. Please try again.")
        },
      }
    )

    setIsLoading(false)
  }

  // ✅ Resend OTP
  const resend = async () => {
    setIsResending(true)
    await authClient.emailOtp.sendVerificationOtp(
      { email, type: "email-verification" },
      {
        onSuccess: () => {
          setError(null)
          toast.success("📩 A new verification code was sent to your email")
        },
        onError: ({ error }) => {
          console.error("❌ Failed to resend OTP:", error)
          setError(error.message)
          toast.error("Failed to resend verification code. Try again later.")
        },
      }
    )
    setIsResending(false)
  }

  return (
    <div className="flex justify-center items-center p-6 md:p-10 max-w-sm md:max-w-3xl m-auto">
      <Card className="max-w-sm w-full shadow-lg ">
        <CardContent className="p-6 space-y-6 text-center">
          <h2 className="text-xl font-bold">Verify your email</h2>
          <p className="text-muted-foreground text-sm">
            Enter the 6-digit code we sent to <strong>{email}</strong>
          </p>

          {/* ✅ OTP Input */}
          <InputOTP
            maxLength={6}
            pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
            value={otp}
            onChange={setOtp}
            className="justify-center flex"
          >
            <InputOTPGroup className="w-full flex items-center justify-center">
              {[...Array(6)].map((_, i) => (
                <InputOTPSlot
                  key={i}
                  index={i}
                  className="border-primary border-[1px] text-lg h-12 w-10  text-center font-semibold focus:ring-2 focus:ring-primary"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>

          {/* ✅ Verify Button with Spinner */}
          <Button className="w-full" onClick={verify} disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin"></span>
                Verifying...
              </div>
            ) : (
              "Verify"
            )}
          </Button>

          {/* ✅ Resend Button with Spinner */}
          <Button variant="link" onClick={resend} disabled={isResending}>
            {isResending ? (
              <div className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 border-2 border-primary/50 border-t-transparent rounded-full animate-spin"></span>
                Sending...
              </div>
            ) : (
              "Resend Code"
            )}
          </Button>

          {error && (
            <Alert className="bg-destructive/10 border-none">
              <AlertTitle>{error}</AlertTitle>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
