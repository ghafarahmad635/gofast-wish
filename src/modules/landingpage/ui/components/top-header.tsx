import Link from 'next/link'
import Image from "next/image"
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { Button } from '@/components/ui/button'

const TopHeader = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  return (
    <header className="w-full bg-white shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">

        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" height={45} width={45} alt="GoFast Wish" />
          <p className="text-lg font-semibold text-gray-800">GoFast Wish</p>
        </Link>

        {/* Right: Conditional Buttons */}
        <div className="flex items-center gap-3">
          {session ? (
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button variant="link" asChild>
                <Link href="/sign-in">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/sign-up">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

      </div>
    </header>
  )
}

export default TopHeader
