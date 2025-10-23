'use client'

import { Card } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
} from 'recharts'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'

// Type definitions
type Completion = { date: string | Date; status: 'completed' | 'skipped' | 'pending' }
type Habit = {
  id: string
  title: string
  frequency: 'daily' | 'weekly' | 'monthly' | string
  completions: Completion[]
}
type Props = { habits: Habit[] }

// Frequency color mapping
const freqColors: Record<string, string> = {
  daily: '#3B82F6', // blue
  weekly: '#8B5CF6', // violet
  monthly: '#10B981', // green
  default: '#6B7280', // gray fallback
}

export default function HabitFrequencyChart({ habits }: Props) {
  const chartData = habits.map((h) => {
    const total = h.completions.length
    const done = h.completions.filter((c) => c.status === 'completed').length
    const completionRate = total ? Math.round((done / total) * 100) : 0
    const lastDone =
      h.completions.filter((c) => c.status === 'completed').pop()?.date ?? null

    // simplified streak = total completions (you can replace with your streak logic)
    const streak = h.completions.filter((c) => c.status === 'completed').length

    return {
      id: h.id,
      name: h.title,
      frequency: h.frequency,
      color: freqColors[h.frequency] || freqColors.default,
      completionRate,
      streak,
      lastDone: lastDone ? format(new Date(lastDone), 'MMM d, yyyy') : '—',
    }
  })

  return (
    <Card className="p-6 bg-white/95 backdrop-blur-md border border-gray-200 shadow-sm rounded-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Habit Completion Overview</h3>
        <p className="text-sm text-gray-500">
          See how consistent you’ve been across all habits.
        </p>
      </div>

      <div className="w-full h-[420px]">
        <ResponsiveContainer>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 40, left: 160, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fill: '#6B7280', fontSize: 12 }}
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={({ x, y, payload }) => {
                const habit = chartData.find((c) => c.name === payload.value)
                return (
                  <g transform={`translate(${x - 10},${y})`}>
                    <text
                      x={0}
                      y={0}
                      dy={4}
                      textAnchor="end"
                      fill="#111827"
                      fontSize={13}
                      fontWeight={500}
                    >
                      {payload.value.length > 18
                        ? payload.value.slice(0, 18) + '…'
                        : payload.value}
                    </text>
                    <foreignObject x={-100} y={-16} width="90" height="30">
                      <Badge
                        variant="secondary"
                        className={`text-[10px] capitalize px-2 py-[1px] bg-opacity-10 border-0`}
                        style={{
                          backgroundColor: habit?.color + '22',
                          color: habit?.color,
                        }}
                      >
                        {habit?.frequency}
                      </Badge>
                    </foreignObject>
                  </g>
                )
              }}
            />
            <Tooltip
              content={({ payload }) => {
                if (!payload?.length) return null
                const d = payload[0].payload
                return (
                  <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm text-xs text-gray-700 space-y-1">
                    <p className="font-semibold text-gray-900">{d.name}</p>
                    <p>
                      <span className="font-medium text-gray-600">Frequency:</span>{' '}
                      {d.frequency}
                    </p>
                    <p>
                      <span className="font-medium text-gray-600">Completion Rate:</span>{' '}
                      {d.completionRate}%
                    </p>
                    <p>
                      <span className="font-medium text-gray-600">Current Streak:</span>{' '}
                      {d.streak} 🔥
                    </p>
                    <p>
                      <span className="font-medium text-gray-600">Last Done:</span>{' '}
                      {d.lastDone}
                    </p>
                  </div>
                )
              }}
            />

            {/** Bars with dynamic colors and subtle gradients */}
            <Bar
              dataKey="completionRate"
              radius={[0, 8, 8, 0]}
              barSize={26}
              shape={(props: any) => {
                const { x, y, width, height, payload } = props
                const color = payload.color
                return (
                  <g>
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      rx={8}
                      ry={8}
                      fill={`url(#grad-${payload.id})`}
                      filter="url(#shadow)"
                    />
                    <defs>
                      <linearGradient id={`grad-${payload.id}`} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={color} stopOpacity={0.6} />
                        <stop offset="100%" stopColor={color} stopOpacity={1} />
                      </linearGradient>
                      <filter id="shadow" height="150%">
                        <feDropShadow
                          dx="0"
                          dy="2"
                          stdDeviation="2"
                          floodColor={color}
                          floodOpacity="0.25"
                        />
                      </filter>
                    </defs>
                  </g>
                )
              }}
            >
              <LabelList
                dataKey="completionRate"
                position="right"
                fill="#111827"
                fontSize={12}
                formatter={(v: number) => `${v}%`}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
