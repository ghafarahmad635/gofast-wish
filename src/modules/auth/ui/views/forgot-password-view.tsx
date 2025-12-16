'use client'
import { useState } from 'react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client.ts'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'

export default function ForgotPasswordView() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const sendOtp = async () => {
    setError(null)
    setSuccess(false)

    if (!email.trim()) {
      toast.error("Please enter your email address")
      return
    }

    setIsLoading(true)

    await authClient.forgetPassword.emailOtp(
      { email },
      {
        onSuccess: () => {
          setError(null)
          setSuccess(true)
          toast.success("✅ Reset code sent! Check your email.")
          router.push(`/reset-password?email=${encodeURIComponent(email)}`)
        },
        onError: ({ error }) => {
          console.error("❌ Failed to send reset code:", error)
          setError(error.message)
          toast.error("Failed to send reset code. Please try again.")
        },
      }
    )

    setIsLoading(false)
  }

  return (
    <div className="flex justify-center items-center min-h-[80vh] p-6 md:p-10 max-w-sm md:max-w-3xl m-auto">
      <Card className="max-w-sm w-full shadow-lg">
        <CardContent className="p-6 space-y-6 text-center">
          <h1 className="text-2xl font-bold">Forgot Password</h1>
          <p className="text-muted-foreground">
            Enter your registered email to receive a reset code.
          </p>

          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="text-center"
          />

          <Button
            onClick={sendOtp}
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin"></span>
                Sending...
              </div>
            ) : (
              "Send Reset Code"
            )}
          </Button>

          {error && (
            <Alert className="bg-destructive/10 border-none">
              <AlertTitle>{error}</AlertTitle>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-100 border-none">
              <AlertTitle>OTP sent! Check your email.</AlertTitle>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
