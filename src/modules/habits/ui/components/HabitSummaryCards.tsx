'use client'

import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { motion } from 'framer-motion'
import { ClipboardList, CheckCircle2, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'

type Props = {
  total: number
  completed: number
  completionRate: number,
 
}

export default function HabitSummaryCards({ total, completed, completionRate }: Props) {
  const [animatedRate, setAnimatedRate] = useState(0)

  // smooth count animation for completion %
  useEffect(() => {
    const start = animatedRate
    const end = completionRate
    const duration = 700
    const startTime = performance.now()
    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1)
      setAnimatedRate(Math.floor(start + (end - start) * progress))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [completionRate])

  const summary = [
    {
      title: 'Total Habits',
      value: total,
      gradient: 'from-blue-500/10 via-blue-400/5 to-blue-500/0',
      iconColor: 'bg-blue-100 text-blue-600',
      textColor: 'text-blue-700',
      subtext: `Tracking ${total} total ${total === 1 ? 'habit' : 'habits'}`,
      icon: <ClipboardList className="w-6 h-6" />,
    },
    {
      title: 'Completed (All Time)',
      value: completed,
      gradient: 'from-green-500/10 via-green-400/5 to-green-500/0',
      iconColor: 'bg-green-100 text-green-600',
      textColor: 'text-green-700',
      subtext: `${completed} of ${total} completed`,
      icon: <CheckCircle2 className="w-6 h-6" />,
    },
    {
      title: 'Overall Completion Rate',
      value: `${animatedRate}%`,
      gradient: 'from-violet-500/10 via-violet-400/5 to-violet-500/0',
      iconColor: 'bg-violet-100 text-violet-600',
      textColor: 'text-violet-700',
      subtext: `${animatedRate}% of all habits completed`,
      icon: <TrendingUp className="w-6 h-6" />,
      progress: animatedRate,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {summary.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.03 }}
          transition={{ delay: i * 0.1, duration: 0.5, ease: 'easeOut' }}
        >
          <Card
            className={`relative p-6 rounded-2xl border border-gray-200 bg-gradient-to-br ${item.gradient}
            backdrop-blur-sm shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-300 group`}
          >
            {/* Shine overlay */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">{item.title}</h3>
              <div
                className={`p-2 rounded-lg flex items-center justify-center ${item.iconColor} shadow-sm`}
              >
                {item.icon}
              </div>
            </div>

            {/* Metric */}
            <div className="mt-5 space-y-1">
              <p
                className={`text-4xl font-bold tracking-tight leading-tight ${item.textColor}`}
              >
                {item.value}
              </p>

              {/* Subtext fades in on hover */}
              <motion.p
                className="text-xs text-gray-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                {item.subtext}
              </motion.p>

              {/* Progress bar for completion */}
              {item.progress !== undefined && (
                <motion.div
                  className="mt-3 flex items-center gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Progress
                    value={item.progress}
                    className="w-full h-2 rounded-full bg-gray-100"
                  />
                  <span className="text-xs font-semibold text-gray-600 w-8 text-right">
                    {item.progress}%
                  </span>
                </motion.div>
              )}
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
