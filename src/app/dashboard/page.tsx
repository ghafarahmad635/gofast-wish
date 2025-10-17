'use client'

import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client.ts'
import { useRouter } from 'next/navigation'
import React from 'react'

const DashboardPage = () => {
  const router = useRouter() // ✅ Move this to the top level

  const handleSignOut = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push('/sign-in') // ✅ Redirect after successful sign-out
          },
        },
      })
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <Button onClick={handleSignOut}>Sign Out</Button>
    </div>
  )
}

export default DashboardPage
