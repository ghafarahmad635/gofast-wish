'use client'
import { useState } from 'react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { useSearchParams, useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client.ts'

export default function ResetPasswordView() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const resetPassword = async () => {
    setError(null)
    const { error } = await authClient.emailOtp.resetPassword({
      email,
      otp,
      password,
    })

    if (error) setError(error.message || "error")
    else {
      alert('✅ Password reset successfully')
      router.push('/sign-in')
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-24 space-y-6 text-center">
      <h1 className="text-2xl font-bold">Reset Password</h1>
      <p className="text-muted-foreground">
        Enter the code we emailed you and your new password.
      </p>

      <Input
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        placeholder="Enter 6-digit code"
      />
      <Input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="New password"
      />
      <Button onClick={resetPassword} className="w-full">
        Reset Password
      </Button>

      {error && (
        <Alert className="bg-destructive/10 border-none">
          <AlertTitle>{error}</AlertTitle>
        </Alert>
      )}
    </div>
  )
}
