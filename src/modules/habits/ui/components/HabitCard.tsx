// HabitCard.tsx
'use client'

import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { CheckCircle, Info, Flame, TrendingUp, CalendarDays, Edit, Trash2 } from 'lucide-react'
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
  frequency: string // "daily" | "weekly" | "monthly"
  startDate: string | Date
  completions: Completion[]
}

type Props = {
  habit: Habit
  mode: 'daily' | 'weekly' | 'monthly'
}

export default function HabitCard({ habit, mode }: Props) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const [justCompleted, setJustCompleted] = useState(false)
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
        setJustCompleted(true)
        await queryClient.invalidateQueries(trpc.habitsTracker.getMany.queryOptions())
        toast.success('Marked as completed!')
        setTimeout(() => setJustCompleted(false), 900)
      },
      onError: (err) => toast.error(`Update failed: ${err.message || 'Try again.'}`),
    })
  )

  const onMark = () => {
    markDone.mutate({ habitId: habit.id, date: new Date() })
  }

  const today = startOfDay(new Date())
  const weekRange = (d: Date) => ({
    start: startOfWeek(d, { weekStartsOn: 1 }),
    end: endOfWeek(d, { weekStartsOn: 1 }),
  })
  const monthRange = (d: Date) => ({ start: startOfMonth(d), end: endOfMonth(d) })

  const buckets = useMemo(() => {
    if (mode === 'daily') {
      const days = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6))
      return days.map((d) => ({
        label: format(d, 'EEE').charAt(0),
        tooltip: format(d, 'MMM d'),
        done: normalizedCompletions.some((c) => isSameDay(c.date, d) && c.status === 'completed'),
      }))
    }
    if (mode === 'weekly') {
      const endWeeks = Array.from({ length: 4 }, (_, i) => subWeeks(today, 3 - i))
      return endWeeks.map((d) => {
        const r = weekRange(d)
        const done = normalizedCompletions.some((c) => isWithinInterval(c.date, r) && c.status === 'completed')
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
      const done = normalizedCompletions.some((c) => isWithinInterval(c.date, r) && c.status === 'completed')
      return {
        label: format(r.start, 'MMM'),
        tooltip: format(r.start, 'MMMM yyyy'),
        done,
      }
    })
  }, [mode, normalizedCompletions, today])

  const completedThisPeriod = useMemo(() => {
    if (mode === 'daily') {
      return normalizedCompletions.some((c) => isSameDay(c.date, today) && c.status === 'completed')
    }
    if (mode === 'weekly') {
      const r = weekRange(today)
      return normalizedCompletions.some((c) => isWithinInterval(c.date, r) && c.status === 'completed')
    }
    const r = monthRange(today)
    return normalizedCompletions.some((c) => isWithinInterval(c.date, r) && c.status === 'completed')
  }, [mode, normalizedCompletions, today])

  const { currentStreak, longestStreak } = useMemo(() => {
    if (mode === 'daily') {
      let current = 0
      let longest = 0
      const keys = new Set(
        normalizedCompletions.filter((c) => c.status === 'completed').map((c) => format(c.date, 'yyyy-MM-dd'))
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

    if (mode === 'weekly') {
      const weekKey = (d: Date) => `${format(startOfWeek(d, { weekStartsOn: 1 }), 'yyyy-MM-dd')}`
      const weeks = new Set(
        normalizedCompletions.filter((c) => c.status === 'completed').map((c) => weekKey(c.date as Date))
      )
      let current = 0
      let longest = 0
      let cursorStart = startOfWeek(today, { weekStartsOn: 1 })
      while (weeks.has(format(cursorStart, 'yyyy-MM-dd'))) {
        current += 1
        cursorStart = addDays(cursorStart, -7)
      }
      const all = Array.from(weeks).map((k) => new Date(k + 'T00:00:00'))
      all.sort((a, b) => a.getTime() - b.getTime())
      let run = 0
      for (let i = 0; i < all.length; i++) {
        if (i > 0 && differenceInCalendarWeeks(all[i], all[i - 1], { weekStartsOn: 1 }) === 1) run++
        else run = 1
        if (run > longest) longest = run
      }
      return { currentStreak: current, longestStreak: longest }
    }

    const monthKey = (d: Date) => format(startOfMonth(d), 'yyyy-MM')
    const months = new Set(
      normalizedCompletions.filter((c) => c.status === 'completed').map((c) => monthKey(c.date as Date))
    )
    let current = 0
    let longest = 0
    let cursorStart = startOfMonth(today)
    while (months.has(format(cursorStart, 'yyyy-MM'))) {
      current += 1
      cursorStart = subMonths(cursorStart, 1)
    }
    const all = Array.from(months).map((k) => new Date(k + '-01T00:00:00'))
    all.sort((a, b) => a.getTime() - b.getTime())
    let run = 0
    for (let i = 0; i < all.length; i++) {
      if (i > 0 && differenceInCalendarMonths(all[i], all[i - 1]) === 1) run++
      else run = 1
      if (run > longest) longest = run
    }
    return { currentStreak: current, longestStreak: longest }
  }, [mode, normalizedCompletions, today])

  const progress = useMemo(() => {
    const doneCount = buckets.filter((b) => b.done).length
    const total = buckets.length
    return Math.round((doneCount / Math.max(total, 1)) * 100)
  }, [buckets])

  const streakLabel = (n: number) => `${n} ${n === 1 ? 'day' : 'days'}`

  return (
    <TooltipProvider>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="h-full">
        <Card className="relative hover:shadow-xl hover:border-primary/40 transition-all duration-300 rounded-2xl bg-white/95 backdrop-blur-sm h-full">
          <CardHeader className="flex justify-between items-center pb-2">
            <CardTitle className="text-base md:text-lg font-semibold text-gray-900">
              {title}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className="text-xxs md:text-xs font-semibold bg-gray-900 text-white capitalize">
                {mode}
              </Badge>
              <div className="flex gap-1 opacity-80 hover:opacity-100 transition">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toast('Edit coming soon')}>
                  <Edit className="h-4 w-4 text-blue-500" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toast('Delete coming soon')}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 line-clamp-2 min-h-[2lh]">{desc || '—'}</p>

            <div>
              <Progress value={progress} className="h-2 rounded-full" />
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>
                  {mode === 'daily' && '7-Day Progress'}
                  {mode === 'weekly' && '4-Week Progress'}
                  {mode === 'monthly' && '6-Month Progress'}
                </span>
                <span>{progress}% complete</span>
              </div>
            </div>

            <div className="flex justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5 text-blue-500" />
                <span>Started: {format(start, 'MMM d, yyyy')}</span>
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 cursor-help">
                    <Info className="w-3 h-3 text-gray-400" />
                    <span>{habit.completions?.length || 0} total entries</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Last done:{' '}
                    {habit.completions?.length
                      ? format(new Date(habit.completions[habit.completions.length - 1].date), 'MMM d, yyyy')
                      : '—'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>

            <div className="flex justify-between gap-1 pt-2">
              {buckets.map((b, i) => (
                <Tooltip key={i}>
                  <TooltipTrigger asChild>
                    <div
                      className={`w-7 h-7 md:w-8 md:h-8 rounded-md flex items-center justify-center text-[10px] md:text-[11px] font-medium ${
                        b.done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                      }`}
                      title={b.tooltip}
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

            <div className="flex justify-between items-center pt-1">
              <div className="flex gap-3 items-center text-sm text-gray-700">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1">
                      <Flame className="h-4 w-4 text-orange-500" />
                      <span>
                        Current:{' '}
                        <span className="font-semibold text-gray-900">{streakLabel(currentStreak)}</span>
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Resets if you miss a {mode.slice(0, -2)} period.</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      <span>
                        Longest:{' '}
                        <span className="font-semibold text-gray-900">{streakLabel(longestStreak)}</span>
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Your all-time best consecutive {mode} streak.</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <Button
                size="sm"
                onClick={onMark}
                disabled={active || completedThisPeriod}
                className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  completedThisPeriod ? 'bg-green-600 hover:bg-green-600/90 text-white' : ''
                }`}
              >
                <CheckCircle className="mr-1 h-4 w-4" />
                {completedThisPeriod ? 'Completed ✅' : active ? 'Updating…' : 'Mark Done'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </TooltipProvider>
  )
}
