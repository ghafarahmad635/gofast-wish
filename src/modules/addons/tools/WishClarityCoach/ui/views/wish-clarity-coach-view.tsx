'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useTRPC } from '@/trpc/client'
import { useSuspenseQuery } from '@tanstack/react-query'
import { ErrorState } from '@/components/error-state'
import { NewGoalDialog } from '@/modules/goals/ui/components/new-goal-dialog'
import GenerateForm from '../components/wish-clarity-form'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useCompletion } from '@ai-sdk/react'
import { Copy, Plus, Sparkles, Square } from 'lucide-react'
import type { FormValues } from '../../schema'

interface Props { id: string }

export default function WishClarityCoachView({ id }: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedIdea, setSelectedIdea] = useState<any | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [goalTitle,setGoalTitle]=useState<string | null>('')
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const trpc = useTRPC()
  const { data } = useSuspenseQuery(
    trpc.addonsRouter.getOneById.queryOptions({ id })
  )

  // Stream lives here
  const { completion, complete, isLoading, stop, error } = useCompletion({
    api: '/api/wish-clarity',
    streamProtocol: 'text',
    onFinish: () => setIsGenerating(false),
    onError: () => setIsGenerating(false),
  })

  // Smooth scroll while generating / when updates arrive
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [isGenerating, completion])

  // Triggered by the form on Complete
  const handleGenerate = async (values: FormValues) => {
    setIsGenerating(true)
    await complete('wish-clarity', { body: values })
  }

  // Mirror loading
  useEffect(() => setIsGenerating(isLoading), [isLoading])

  // Open dialog with current plan
  const handleAddToWishlist = () => {
    console.log("title ",goalTitle)
    
    setSelectedIdea({
      title:  goalTitle,
      description: completion || '',
      
    })
    setIsDialogOpen(true)
  }



  return (
    <>
      <NewGoalDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        defaultValues={selectedIdea || undefined}
      />

      <div className="py-5 px-4 space-y-4">
        <div>
          <h1 className="text-3xl font-bold">{data.name}</h1>
          <p>{data.description}</p>
        </div>

        {/* Form */}
        <GenerateForm onGenerate={handleGenerate} isPending={isLoading} setGoalTitle={setGoalTitle}/>

        {/* Output */}
        {(completion || isLoading || error) && (
          <Card className="mt-6 p-4">
            <div className="flex items-center gap-2 mb-3">
              {isLoading && (
                <Button variant="outline" size="sm" onClick={stop}>
                  <Square className="mr-2 h-4 w-4" />
                  Stop
                </Button>
              )}
              {!!completion && (
                <>
                  
                  <Button size="sm" onClick={handleAddToWishlist}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add to wishlist
                  </Button>
                </>
              )}
            </div>

           {isLoading && (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="h-8 w-8 rounded-full bg-primary/15 animate-pulse" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">Thinking…</span>
              </div>
            )}
            {error && (
              <div className="text-sm text-destructive">Error: {error.message}</div>
            )}

            {/* streamed text */}
            <div className="whitespace-pre-wrap">{completion}</div>
          </Card>
        )}

        <div ref={bottomRef} />
      </div>
    </>
  )
}

export const WishClarityCoachViewLoadingState = () => (
  <div className="py-10 px-4">
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-1/3 bg-gray-200 rounded" />
      <div className="h-6 w-1/2 bg-gray-200 rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-5 border border-gray-200 rounded-xl bg-gray-100 h-32" />
        ))}
      </div>
    </div>
  </div>
)

export const WishClarityCoachViewErrorState = () => (
  <ErrorState
    title=" Something went wrong"
    description=" We couldn’t load your add-on data. Please try again later."
  />
)
