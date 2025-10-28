import ResetPasswordOTPView from '@/modules/auth/ui/views/reset-password-view'
import { redirect } from 'next/navigation'

interface ResetPasswordPageProps {
  searchParams: Promise<{ email?: string }>
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams
  const email = params.email

  if (!email) {
    redirect('/sign-up')
  }

  return <ResetPasswordOTPView email={email} />
}
