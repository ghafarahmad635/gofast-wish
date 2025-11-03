"use client"
import Image from "next/image"
import { format } from "date-fns"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tag, Calendar, AlertCircle, Check, Edit2, Trash2, Loader2 } from "lucide-react"
import React from "react"

interface GoalCardProps {
  goal: any
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onToggleComplete?: (id: string) => void
  isToggling?: boolean
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onEdit,
  onDelete,
  onToggleComplete,
  isToggling,
}) => {
  const targetDate = goal.targetDate
    ? format(new Date(goal.targetDate), "MMM d, yyyy")
    : null

  const isCompleted = goal.isCompleted

  return (
    <Card
      key={goal.id}
      className="group relative overflow-hidden border border-gray-200 rounded-lg shadow-sm 
                 hover:shadow-lg transition-all duration-300 
                 bg-white/90 backdrop-blur-sm p-0 gap-0"
    >
      {/* ✅ Image section (only visual difference when completed) */}
      <div className="relative w-full aspect-[16/9] overflow-hidden rounded-t-lg">
        {goal.featuredImage?.url ? (
          <Image
            src={goal.featuredImage.url}
            alt={goal.title}
            fill
            className={`object-cover transition-transform duration-500 group-hover:scale-105 ${
              isCompleted ? "grayscale-[40%] brightness-90" : ""
            }`}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-500 text-sm">
            No Image
          </div>
        )}

        {/* ✅ Completed overlay + check badge */}
        {isCompleted && (
          <>
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"></div>
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-green-600 text-white text-xs font-medium px-2.5 py-1.5 rounded-md shadow-md">
              <Check className="w-3.5 h-3.5" />
              Completed
            </div>
          </>
        )}
      </div>

      {/* Header */}
      <CardHeader className="px-5 mt-3 mb-1.5">
        <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors duration-300">
          {goal.title}
        </CardTitle>
      </CardHeader>

      {/* Body */}
      <CardContent className="px-5 text-sm text-gray-600 space-y-3">
        <p className="leading-relaxed text-gray-700">{goal.description}</p>

        <div className="flex flex-wrap justify-between items-center text-xs text-gray-500 gap-2 border-t py-2">
          <div className="flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-gray-400" />
            <span className="capitalize">
              {goal.category || "Uncategorized"}
            </span>
          </div>

          {goal.priority && (
            <div className="flex items-center gap-1">
              <AlertCircle
                className={`w-3.5 h-3.5 ${
                  goal.priority === 1
                    ? "text-red-500"
                    : goal.priority === 2
                    ? "text-yellow-600"
                    : "text-green-600"
                }`}
              />
              <span
                className={`font-medium ${
                  goal.priority === 1
                    ? "text-red-500"
                    : goal.priority === 2
                    ? "text-yellow-600"
                    : "text-green-600"
                }`}
              >
                {goal.priority === 1
                  ? "High"
                  : goal.priority === 2
                  ? "Medium"
                  : "Low"}
              </span>
            </div>
          )}

          {targetDate && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-gray-700 font-medium">{targetDate}</span>
            </div>
          )}
        </div>
      </CardContent>

      {/* Footer */}
      <div className="flex justify-between items-center px-5 pb-5 border-t pt-3 w-full relative flex-wrap">
        <div className="flex gap-2">
          {onEdit && (
            <Button
              size="sm"
              variant="outline"
              className="text-gray-600 border-gray-300 hover:text-primary hover:border-primary flex items-center gap-1"
              onClick={() => onEdit(goal.id)}
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </Button>
          )}

          {onDelete && (
            <Button
              size="sm"
              variant="outline"
              className="text-gray-600 border-gray-300 hover:text-red-600 hover:border-red-400 flex items-center gap-1"
              onClick={() => onDelete(goal.id)}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          )}
        </div>

        {/* Toggle Complete */}
        {onToggleComplete && (
          <Button
            size="sm"
            variant={isCompleted ? "outline" : "default"}
            disabled={isToggling}
            className={`flex items-center gap-1 ${
              isCompleted
                ? "text-yellow-600 border-yellow-400 hover:bg-yellow-50"
                : "bg-primary text-white hover:bg-primary/90"
            } ${isToggling ? "opacity-80 cursor-not-allowed" : ""}`}
            onClick={() => onToggleComplete(goal.id)}
          >
            {isToggling ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating...
              </>
            ) : isCompleted ? (
              <>
                <AlertCircle className="w-4 h-4" />
                Mark Incomplete
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Mark Complete
              </>
            )}
          </Button>
        )}
      </div>
    </Card>
  )
}
