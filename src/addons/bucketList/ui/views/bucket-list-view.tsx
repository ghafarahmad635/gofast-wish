'use client'

import React, { useState } from 'react'
import GenerateForm from '../components/generate-form'
import { useTRPC } from '@/trpc/client';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { ErrorState } from '@/components/error-state';
import BucketListIdeaCard from '../components/bucket-list-idea-card';
import { toast } from 'sonner';
import { NewGoalDialog } from '@/modules/goals/ui/components/new-goal-dialog';

interface Props{
  id:string
}
export default function BucketListView({id}:Props) {
  
  
  const [ideas, setIdeas] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false)
   const trpc = useTRPC()
    const { data } = useSuspenseQuery(trpc.bucketListRouter.getOneById.queryOptions({
      id
    }));
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedIdea, setSelectedIdea] = useState<any | null>(null)
     
  return (
    <>
   <NewGoalDialog 
    open={isDialogOpen} 
    onOpenChange={setIsDialogOpen}
      defaultValues={selectedIdea || undefined}
    />
      <div className="py-10 px-4">
        <h1 className="text-3xl font-bold mb-6">
          {data.name}
        </h1>

        <GenerateForm onGenerate={setIdeas} toolID={id}  onLoadingChange={setIsGenerating}/>
        {/* ✅ Show loader while generating */}
        {isGenerating && (
          <div className="mt-8 animate-pulse space-y-4">
            <div className="h-6 w-1/2 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-5 border border-gray-200 rounded-xl bg-gray-100 h-32"></div>
              ))}
            </div>
          </div>
        )}
        {/* ✅ Show results */}
        {!isGenerating && ideas.length > 0 && (
          <div className="mt-10">
            <h2 className="text-2xl font-semibold mb-4">Generated Ideas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {ideas.map((idea, i) => (
                <BucketListIdeaCard
                  key={i}
                  index={i}
                  title={idea.title}
                  description={idea.description}
                  category={idea.category}
                  onOpenDialog={(idea) => {
                    setSelectedIdea(idea)
                    setIsDialogOpen(true)
                  }}
                />
              ))}
            </div>
          </div>
        )}

        
      </div>
     </>
  )
}

export const BucketListViewLoadingState = () => {
  return (
    <div className="py-10 px-4">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-1/3 bg-gray-200 rounded"></div>
        <div className="h-6 w-1/2 bg-gray-200 rounded"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="p-5 border border-gray-200 rounded-xl bg-gray-100 h-32"
            ></div>
          ))}
        </div>
      </div>
    </div>
  )
}

export const BucketListViewErrorState = () => {
  return (
    <ErrorState
      title=" Something went wrong"
      description=" We couldn’t load your add-on data. Please try again later."
    />
    
  )
}
