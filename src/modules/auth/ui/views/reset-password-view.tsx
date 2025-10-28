'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client.ts'
import { Card, CardContent } from '@/components/ui/card'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'

interface ResetPasswordViewProps {
  email: string
}

export default function ResetPasswordOTPView({ email }: ResetPasswordViewProps) {
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const router = useRouter()

  // ✅ Reset Password
  const resetPassword = async () => {
    setError(null)

    if (otp.length < 6) {
      toast.error('Please enter the 6-digit code')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)

    await authClient.emailOtp.resetPassword(
      { email, otp, password },
      {
        onSuccess: () => {
          toast.success('✅ Password reset successfully!')
          router.push('/sign-in')
        },
        onError: ({ error }) => {
          console.error('❌ Password reset failed:', error)
          setError(error.message)
          toast.error('Invalid code or expired OTP.')
        },
      }
    )

    setIsLoading(false)
  }

  // ✅ Resend OTP
  const resendOtp = async () => {
    setIsResending(true)

    await authClient.emailOtp.sendVerificationOtp(
      { email, type: 'forget-password' },
      {
        onSuccess: () => {
          setError(null)
          toast.success('📩 A new reset code was sent to your email')
        },
        onError: ({ error }) => {
          console.error('❌ Failed to resend OTP:', error)
          setError(error.message)
          toast.error('Failed to resend reset code. Try again later.')
        },
      }
    )

    setIsResending(false)
  }

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <Card className="max-w-sm w-full shadow-lg">
        <CardContent className="p-6 space-y-6 text-center">
          <h1 className="text-2xl font-bold">Reset Password</h1>
          <p className="text-muted-foreground">
            Enter the 6-digit code sent to <strong>{email}</strong> and choose a new password.
          </p>

          {/* ✅ OTP Input */}
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
              value={otp}
              onChange={setOtp}
            >
              <InputOTPGroup className="flex items-center justify-center">
                {[...Array(6)].map((_, i) => (
                  <InputOTPSlot
                    key={i}
                    index={i}
                    className="border-primary border-[1px] text-lg h-12 w-10 text-center font-semibold focus:ring-2 focus:ring-primary"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          {/* ✅ Password Input with Eye Toggle */}
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              className="text-center pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {/* ✅ Reset Button */}
          <Button className="w-full" onClick={resetPassword} disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin"></span>
                Resetting...
              </div>
            ) : (
              'Reset Password'
            )}
          </Button>

          {/* ✅ Resend + Back Options */}
          <div className="flex justify-between text-sm mt-2">
            <Button
              variant="link"
              onClick={resendOtp}
              disabled={isResending}
              className="text-primary p-0"
            >
              {isResending ? (
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 border-2 border-primary/60 border-t-transparent rounded-full animate-spin"></span>
                  Resending...
                </div>
              ) : (
                'Resend Code'
              )}
            </Button>

            {/* 🔙 Back button — wrap with Link where needed */}
            <Button variant="link" className="text-muted-foreground p-0">
              Back
            </Button>
          </div>

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
