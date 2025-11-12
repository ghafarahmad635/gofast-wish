'use client'

import React from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface BucketListIdeaCardProps {
  title: string
  description: string
  category: string
  index?: number
   onOpenDialog?: (idea: { title: string; description: string; category: string }) => void
}

const BucketListIdeaCard: React.FC<BucketListIdeaCardProps> = ({
  title,
  description,
  category,
  index,
  onOpenDialog,
}) => {
  return (
    <Card
      className="flex flex-col justify-between border border-gray-200 bg-white shadow-sm 
                 hover:shadow-md hover:scale-[1.01] transition-transform duration-200 cursor-default"
    >
      <CardHeader className="pb-2">
        {index !== undefined && (
          <span className="text-xs text-gray-400 mb-1 block">#{index + 1}</span>
        )}
        <CardTitle className="text-lg font-semibold text-gray-800 line-clamp-2">
          {title}
        </CardTitle>
        <CardDescription className="text-gray-600 text-sm line-clamp-3">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="text-sm text-blue-600 font-medium">
        #{category}
      </CardContent>

      <CardFooter className="pt-0 flex justify-end">
        <Button
          
         
          className=""
          onClick={() => onOpenDialog?.({ title, description, category })}
        >
          Add to List
        </Button>
      </CardFooter>
    </Card>
  )
}

export default BucketListIdeaCard
