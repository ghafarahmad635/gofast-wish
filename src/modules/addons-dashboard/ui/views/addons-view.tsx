'use client'

import { useRouter } from 'next/navigation'
import { useTRPC } from '@/trpc/client'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function AddonsView() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const router = useRouter()

  // ✅ Fetch all add-ons
  const { data } = useSuspenseQuery(trpc.addOnRouter.getMany.queryOptions())

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-6">Available Add-ons</h1>

      {/* ✅ Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((addon: any) => (
          <Card
            key={addon.id}
            className="group border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all bg-white/90 backdrop-blur-sm"
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-lg font-semibold">{addon.name}</span>
                {addon.isPremium && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-md">
                    Premium
                  </span>
                )}
              </CardTitle>
              {addon.category && (
                <CardDescription className="capitalize text-gray-500">
                  {addon.category}
                </CardDescription>
              )}
            </CardHeader>

            <CardContent>
              <p className="text-sm text-gray-600 line-clamp-3">
                {addon.description || 'No description available.'}
              </p>
            </CardContent>

            <CardFooter className="flex justify-between items-center">
              <Button
              asChild
                
                
                className="bg-primary text-white hover:bg-primary/90"
              >
                
                <Link href={`${addon.url}/${addon.id}`}>
                Open
                </Link>
              </Button>
              
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
export const AddonsViewLoadingState = () => {
  return (
    <div className="p-6 animate-pulse">
      <div className="h-8 w-1/3 bg-gray-200 rounded mb-6"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-40 bg-gray-100 rounded-xl border border-gray-200 shadow-sm"
          ></div>
        ))}
      </div>
    </div>
  )
}
export const AddonsViewErrorState = () => {
  return (
    <div className="p-6 text-center text-gray-600">
      <p className="text-lg font-medium mb-2">Failed to load add-ons</p>
      <p className="text-sm text-gray-500">Please refresh or try again later.</p>
    </div>
  )
}
