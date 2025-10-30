import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import React from 'react'

const page = async() => {
  const sesstion=await auth.api.getSession({
    headers:await headers()
  })
  return (
    <div>
     
      {sesstion?.user.email}
    </div>
  )
}

export default page
