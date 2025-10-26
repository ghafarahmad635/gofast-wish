import VerifyOtpView from '@/modules/auth/ui/views/VerifyOtpView'
import { redirect } from 'next/navigation'

interface VerifyOtpPageProps {
  searchParams: Promise<{ email?: string }>
}

export default async function VerifyOtpPage({ searchParams }: VerifyOtpPageProps) {
  const params = await searchParams
  const email = params.email

  if (!email) {
    redirect('/sign-up')
  }

  return <VerifyOtpView email={email} />
}
