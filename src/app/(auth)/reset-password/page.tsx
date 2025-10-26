import ResetPasswordView from '@/modules/auth/ui/views/reset-password-view'

interface ResetPasswordPageProps {
  searchParams?: { email?: string }
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const email = searchParams?.email ?? ''
  return <ResetPasswordView email={email} />
}
