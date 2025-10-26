'use client'
import { useState } from 'react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client.ts'

export default function ForgotPasswordView() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const sendOtp = async () => {
    setError(null)
    setSuccess(false)

    const { error } = await authClient.forgetPassword.emailOtp({
      email,
    })

    if (error) setError(error.message || "Error")
    else {
      setSuccess(true)
      router.push(`/reset-password?email=${encodeURIComponent(email)}`)
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-24 space-y-6 text-center">
      <h1 className="text-2xl font-bold">Forgot Password</h1>
      <p className="text-muted-foreground">
        Enter your registered email to receive a reset code.
      </p>
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
      />
      <Button onClick={sendOtp} className="w-full">
        Send Reset Code
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
    </div>
  )
}
