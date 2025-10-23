'use client'

import { Card } from '@/components/ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { format, subDays } from 'date-fns'

type Completion = { date: string | Date; status: string }

type Props = {
  habits: { completions: Completion[] }[]
}

export default function HabitTrendChart({ habits }: Props) {
  const today = new Date()
  const days = Array.from({ length: 7 }, (_, i) => subDays(today, 6 - i))

  const data = days.map((d) => {
    const dayLabel = format(d, 'EEE')
    const completionsForDay = habits.flatMap((h) =>
      h.completions.filter(
        (c) =>
          new Date(c.date).toDateString() === d.toDateString() &&
          c.status === 'completed'
      )
    )
    return { name: dayLabel, completed: completionsForDay.length }
  })

  return (
    <Card className="p-6 bg-white/95 backdrop-blur-md border border-gray-200 shadow-sm rounded-2xl">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Last 7 Days Activity
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        This chart shows how many habits you’ve completed each day.
      </p>

      <div className="w-full h-64">
        <ResponsiveContainer>
          <LineChart
            data={data}
            margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
          >
            <defs>
              {/* Gradient for the line */}
              <linearGradient id="lineColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0.2} />
              </linearGradient>

              {/* Shadow glow */}
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis
              dataKey="name"
              tick={{ fill: '#6B7280', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />

            {/* Custom tooltip */}
            <Tooltip
              content={({ payload }) => {
                if (!payload?.length) return null
                const d = payload[0].payload
                return (
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-3 py-2 text-xs text-gray-700">
                    <p className="font-semibold text-gray-900">
                      {d.name}: {d.completed} completed
                    </p>
                  </div>
                )
              }}
            />

            {/* Smooth animated line */}
            <Line
              type="monotone"
              dataKey="completed"
              stroke="url(#lineColor)"
              strokeWidth={3}
              dot={{
                r: 5,
                stroke: '#fff',
                strokeWidth: 2,
                fill: '#10B981',
              }}
              activeDot={{
                r: 7,
                fill: '#10B981',
                stroke: '#10B981',
                strokeWidth: 2,
              }}
              filter="url(#glow)"
              isAnimationActive={true}
              animationDuration={800}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
