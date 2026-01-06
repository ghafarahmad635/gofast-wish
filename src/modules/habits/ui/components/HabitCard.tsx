'use client'

import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip'
import {
  CheckCircle,
  Flame,
  TrendingUp,
  CalendarDays,
  Edit,
  Trash2,
  Info,
} from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { useTRPC } from '@/trpc/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  addDays,
  startOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subWeeks,
  subMonths,
  isSameDay,
  isWithinInterval,
  format,
  differenceInCalendarWeeks,
  differenceInCalendarMonths,
} from 'date-fns'

type Completion = { date: string | Date; status: 'completed' | 'skipped' | 'pending' }
type Habit = {
  id: string
  title: string
  description?: string | null
  frequency: string
  startDate: string | Date
  completions: Completion[]
}

type Props = {
  habit: Habit
  mode: 'daily' | 'weekly' | 'monthly'
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export default function HabitCard({ habit, mode, onEdit, onDelete }: Props) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const [active, setActive] = useState(false)

  const title = habit.title
  const desc = habit.description || ''
  const start = new Date(habit.startDate)
  const normalizedCompletions = useMemo(
    () => (habit.completions || []).map((c) => ({ ...c, date: new Date(c.date) })),
    [habit.completions]
  )

  const markDone = useMutation(
    trpc.habitsTracker.markDone.mutationOptions({
      onMutate: () => setActive(true),
      onSettled: () => setActive(false),
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.habitsTracker.getMany.queryOptions({}))
        await queryClient.invalidateQueries(trpc.habitsTracker.getManyByFrequency.queryOptions({}))
        await queryClient.invalidateQueries(
          trpc.habitsTracker.getCompletions.queryOptions({ habitId: habit.id })
        )
        toast.success('Marked as completed!')
      },
      onError: (err) => toast.error(`Update failed: ${err.message || 'Try again.'}`),
    })
  )

  const onMark = () => markDone.mutate({ habitId: habit.id, date: new Date() })

  const today = startOfDay(new Date())
  const weekRange = (d: Date) => ({
    start: startOfWeek(d, { weekStartsOn: 1 }),
    end: endOfWeek(d, { weekStartsOn: 1 }),
  })
  const monthRange = (d: Date) => ({
    start: startOfMonth(d),
    end: endOfMonth(d),
  })

  const buckets = useMemo(() => {
    if (mode === 'daily') {
      const days = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6))
      return days.map((d) => ({
        label: format(d, 'EEE').charAt(0),
        tooltip: format(d, 'MMM d'),
        done: normalizedCompletions.some(
          (c) => isSameDay(c.date, d) && c.status === 'completed'
        ),
      }))
    }
    if (mode === 'weekly') {
      const endWeeks = Array.from({ length: 4 }, (_, i) => subWeeks(today, 3 - i))
      return endWeeks.map((d) => {
        const r = weekRange(d)
        const done = normalizedCompletions.some(
          (c) => isWithinInterval(c.date, r) && c.status === 'completed'
        )
        return {
          label: `W${format(r.start, 'w')}`,
          tooltip: `${format(r.start, 'MMM d')} – ${format(r.end, 'MMM d')}`,
          done,
        }
      })
    }
    const endMonths = Array.from({ length: 6 }, (_, i) => subMonths(today, 5 - i))
    return endMonths.map((d) => {
      const r = monthRange(d)
      const done = normalizedCompletions.some(
        (c) => isWithinInterval(c.date, r) && c.status === 'completed'
      )
      return {
        label: format(r.start, 'MMM'),
        tooltip: format(r.start, 'MMMM yyyy'),
        done,
      }
    })
  }, [mode, normalizedCompletions, today])

  const completedThisPeriod = useMemo(() => {
    if (mode === 'daily') {
      return normalizedCompletions.some(
        (c) => isSameDay(c.date, today) && c.status === 'completed'
      )
    }
    if (mode === 'weekly') {
      const r = weekRange(today)
      return normalizedCompletions.some(
        (c) => isWithinInterval(c.date, r) && c.status === 'completed'
      )
    }
    const r = monthRange(today)
    return normalizedCompletions.some(
      (c) => isWithinInterval(c.date, r) && c.status === 'completed'
    )
  }, [mode, normalizedCompletions, today])

  const { currentStreak, longestStreak } = useMemo(() => {
    if (mode === 'daily') {
      let current = 0
      let longest = 0
      const keys = new Set(
        normalizedCompletions
          .filter((c) => c.status === 'completed')
          .map((c) => format(c.date, 'yyyy-MM-dd'))
      )
      let cursor = today
      while (keys.has(format(cursor, 'yyyy-MM-dd'))) {
        current += 1
        cursor = addDays(cursor, -1)
      }
      const allDays = Array.from(keys).map((k) => new Date(k + 'T00:00:00'))
      allDays.sort((a, b) => a.getTime() - b.getTime())
      let run = 0
      for (let i = 0; i < allDays.length; i++) {
        if (i > 0 && +addDays(allDays[i - 1], 1) === +allDays[i]) run++
        else run = 1
        if (run > longest) longest = run
      }
      return { currentStreak: current, longestStreak: longest }
    }
    return { currentStreak: 0, longestStreak: 0 }
  }, [mode, normalizedCompletions, today])

  const progress = useMemo(() => {
    const doneCount = buckets.filter((b) => b.done).length
    const total = buckets.length
    return Math.round((doneCount / Math.max(total, 1)) * 100)
  }, [buckets])

  const streakLabel = (n: number) => `${n} ${n === 1 ? 'day' : 'days'}`

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-full w-full overflow-hidden max-w-full"
      >
        <Card className="relative h-full w-full max-w-full min-w-0 overflow-hidden hover:shadow-xl transition-all duration-300 rounded-2xl bg-white">
          {/* Header */}
          <CardHeader className="flex justify-between items-center pb-2 min-w-0 flex-wrap gap-2">
            <CardTitle className="text-base md:text-lg font-semibold text-gray-900 truncate">
              {title}
            </CardTitle>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge className="text-xxs md:text-xs font-semibold bg-gray-900 text-white capitalize">
                {mode}
              </Badge>
              <div className="flex gap-1">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onEdit(habit.id)}
                  >
                    <Edit className="h-4 w-4 text-blue-500" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onDelete(habit.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          {/* Body */}
          <CardContent className="space-y-4 overflow-hidden wrap-break-words max-w-full">
           <div
          className="rt"
          dangerouslySetInnerHTML={{ __html: habit.description ?? "" }}
        />

            <Progress value={progress} className="h-2 rounded-full" />
            <div className="flex justify-between mt-1 text-xs text-gray-500 min-w-0 flex-wrap gap-2">
              <span>
                {mode === 'daily'
                  ? '7-Day Progress'
                  : mode === 'weekly'
                  ? '4-Week Progress'
                  : '6-Month Progress'}
              </span>
              <span>{progress}% complete</span>
            </div>

            <div className="flex justify-between text-xs text-gray-500 flex-wrap gap-2 min-w-0">
              <div className="flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5 text-blue-500" />
                <span className="truncate">
                  Started: {format(start, 'MMM d, yyyy')}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Info className="w-3 h-3 text-gray-400" />
                <span className="truncate">
                  {habit.completions?.length || 0} total entries
                </span>
              </div>
            </div>

            {/* ✅ Fixed Section (No Overflow) */}
            <div className="flex flex-wrap justify-between gap-2 pt-2 w-full overflow-hidden">
              {buckets.map((b, i) => (
                <Tooltip key={i}>
                  <TooltipTrigger asChild>
                    <div
                      className={`w-7 h-7 md:w-8 md:h-8 rounded-md flex items-center justify-center text-[10px] md:text-[11px] font-medium ${
                        b.done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {b.label}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {b.tooltip}: {b.done ? 'Completed ✅' : 'Not done'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center pt-1 min-w-0 flex-wrap gap-2">
              <div className="flex gap-3 items-center text-sm text-gray-700 flex-wrap">
                <div className="flex items-center gap-1">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span>
                    Current:{' '}
                    <span className="font-semibold text-gray-900">
                      {streakLabel(currentStreak)}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <span>
                    Longest:{' '}
                    <span className="font-semibold text-gray-900">
                      {streakLabel(longestStreak)}
                    </span>
                  </span>
                </div>
              </div>

              <Button
                size="sm"
                onClick={onMark}
                disabled={active || completedThisPeriod}
                className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  completedThisPeriod
                    ? 'bg-green-600 hover:bg-green-600/90 text-white'
                    : ''
                }`}
              >
                <CheckCircle className="mr-1 h-4 w-4" />
                {completedThisPeriod
                  ? 'Completed ✅'
                  : active
                  ? 'Updating…'
                  : 'Mark Done'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </TooltipProvider>
  )
}
