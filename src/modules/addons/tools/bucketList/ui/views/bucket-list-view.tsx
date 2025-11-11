'use client'

import React, { useEffect, useRef, useState } from 'react'
import GenerateForm from '../components/bucket-generate-form'
import { useTRPC } from '@/trpc/client';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ErrorState } from '@/components/error-state';
import BucketListIdeaCard from '../components/bucket-list-idea-card';
import { NewGoalDialog } from '@/modules/goals/ui/components/new-goal-dialog';
import { Ideas } from '../../schema';


interface Props{
  id:string
}
export default function BucketListView({id}:Props) {
  
  
  
  const [ideas, setIdeas] = useState<Ideas>([]);  
  const [isGenerating, setIsGenerating] = useState(false)
  const bottomRef = useRef<HTMLDivElement | null>(null);
  
   const trpc = useTRPC()
    const { data } = useSuspenseQuery(trpc.addonsRouter.getOneById.queryOptions({
      id
    }));
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedIdea, setSelectedIdea] = useState<any | null>(null)
    // Smooth scroll whenever plans change or while generating
      useEffect(() => {
        if (bottomRef.current) {
          bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
        }
      }, [ideas, isGenerating]);
    
     
  return (
    <>
   <NewGoalDialog 
    open={isDialogOpen} 
    onOpenChange={setIsDialogOpen}
      defaultValues={selectedIdea || undefined}
    />
      <div className="py-5 px-4">
        <h1 className="text-3xl font-bold">
          {data.name}
        </h1>
        <p>{data.description}</p>

        <GenerateForm onGenerate={setIdeas} toolID={id}  onLoadingChange={setIsGenerating}/>
        {/* ✅ Show loader while generating */}
       {isGenerating && ideas.length === 0 && (
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
        {ideas.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-semibold">Generated Ideas</h2>
              {isGenerating && (
                <span className="text-sm px-2 py-1 rounded bg-gray-100 border">
                  Generating…
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {ideas.map((idea, i) => (
                <BucketListIdeaCard
                  key={`${idea.title}-${i}`}
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
               <div ref={bottomRef} />
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
