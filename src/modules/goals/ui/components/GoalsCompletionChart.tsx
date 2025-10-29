'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Label as RechartsLabel,
  LineChart,
  Line,
  XAxis,
  YAxis,
} from 'recharts'
import { format, subDays, subWeeks, subMonths } from 'date-fns'

interface Goal {
  id: string
  isCompleted: boolean
  createdAt?: string | Date
  updatedAt?: string | Date
}

interface Props {
  goals: Goal[]
}

const COLORS = ['#10B981', '#F87171'] // Green & Red

export default function GoalsCompletionChart({ goals }: Props) {
  const total = goals.length
  const completed = goals.filter((g) => g.isCompleted).length
  const remaining = total - completed
  const rate = total ? Math.round((completed / total) * 100) : 0

  const [animatedRate, setAnimatedRate] = useState(0)
  const [range, setRange] = useState<'7d' | '4w' | '3m'>('7d')

  // ✅ Animate percentage counter
  useEffect(() => {
    let start = 0
    const duration = 700
    const startTime = performance.now()
    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1)
      setAnimatedRate(Math.floor(progress * rate))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [rate])

  const noData = total === 0

  // ✅ Donut Chart Data
  const data = [
    { name: 'Completed', value: completed, color: COLORS[0] },
    { name: 'Not Completed', value: remaining, color: COLORS[1] },
  ]

  // ✅ Sparkline Data (now fully working)
  const sparklineData = useMemo(() => {
    if (!goals.length) return []

    const now = new Date()

    if (range === '7d') {
      const days = Array.from({ length: 7 }, (_, i) => subDays(now, 6 - i))
      return days.map((d) => {
        const label = format(d, 'EEE')
        const count = goals.filter(
          (g) =>
            g.isCompleted &&
            (g.updatedAt || g.createdAt) &&
            format(new Date(g.updatedAt || g.createdAt!), 'yyyy-MM-dd') ===
              format(d, 'yyyy-MM-dd')
        ).length
        return { label, value: count }
      })
    }

    if (range === '4w') {
      const weeks = Array.from({ length: 4 }, (_, i) => subWeeks(now, 3 - i))
      return weeks.map((w) => {
        const start = subWeeks(w, 1)
        const label = `Week ${format(w, 'w')}`
        const count = goals.filter((g) => {
          const date = new Date(g.updatedAt || g.createdAt || '')
          return g.isCompleted && date >= start && date <= w
        }).length
        return { label, value: count }
      })
    }

    if (range === '3m') {
      const months = Array.from({ length: 3 }, (_, i) => subMonths(now, 2 - i))
      return months.map((m) => {
        const start = subMonths(m, 1)
        const label = format(m, 'MMM')
        const count = goals.filter((g) => {
          const date = new Date(g.updatedAt || g.createdAt || '')
          return g.isCompleted && date >= start && date <= m
        }).length
        return { label, value: count }
      })
    }

    return []
  }, [goals, range])

  return (
    <Card className="p-6 bg-white/95 backdrop-blur-md border border-gray-200 shadow-sm rounded-2xl">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Goal Completion Overview</h3>
          <p className="text-sm text-gray-500">
            See your progress trend over the last days, weeks, or months.
          </p>
        </div>

        {/* ✅ Modern Range Toggle Buttons */}
        <div className="flex bg-gray-100 rounded-full p-1 shadow-inner border border-gray-200 w-fit">
          {[
            { label: '7D', value: '7d' },
            { label: '4W', value: '4w' },
            { label: '3M', value: '3m' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRange(opt.value as any)}
              className={`relative px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                range === opt.value
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-400 text-white shadow-md scale-[1.05]'
                  : 'text-gray-600 hover:bg-white hover:text-gray-900'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ✅ Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        {/* Left: Donut Chart */}
        <div className="col-span-2 h-[320px]">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={noData ? [{ name: 'Empty', value: 1, color: '#E5E7EB' }] : data}
                dataKey="value"
                innerRadius={80}
                outerRadius={120}
                startAngle={90}
                endAngle={-270}
                paddingAngle={4}
                isAnimationActive
              >
                {(noData ? [{ color: '#E5E7EB' }] : data).map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
                <RechartsLabel
                  position="center"
                  content={() => (
                    <g>
                      <text x="50%" y="44%" textAnchor="middle" fill="#6B7280" fontSize={12}>
                        Completion
                      </text>
                      <text
                        x="50%"
                        y="56%"
                        textAnchor="middle"
                        fill="#111827"
                        fontSize={30}
                        fontWeight={700}
                      >
                        {noData ? '—' : `${animatedRate}%`}
                      </text>
                      {!noData && (
                        <text x="50%" y="68%" textAnchor="middle" fill="#6B7280" fontSize={12}>
                          {completed}/{total} goals
                        </text>
                      )}
                    </g>
                  )}
                />
              </Pie>

              <Tooltip
                formatter={(value: any, name: any) => {
                  const v = Number(value || 0)
                  const pct = total ? Math.round((v / total) * 100) : 0
                  return [`${v} goals (${pct}%)`, name]
                }}
                contentStyle={{
                  borderRadius: 10,
                  border: '1px solid #E5E7EB',
                  fontSize: 13,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Right: Sparkline + Stats */}
        <div className="flex flex-col gap-4">
          <StatCard title="Total Goals" value={total} />
          <StatCard
            title="Completed"
            value={completed}
            subtitle={`${rate}% complete`}
            color="#10B981"
            sparklineData={sparklineData}
          />
          <StatCard title="Not Completed" value={remaining} color="#F87171" />
        </div>
      </div>
    </Card>
  )
}

/* ✅ Reusable StatCard Component */
function StatCard({
  title,
  value,
  subtitle,
  color,
  sparklineData,
}: {
  title: string
  value: number | string
  subtitle?: string
  color?: string
  sparklineData?: { label: string; value: number }[]
}) {
  return (
    <div
      className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm hover:shadow-md transition-all duration-200"
      style={{
        boxShadow: color ? `inset 0 0 0 2px ${color}22` : 'inset 0 0 0 2px #E5E7EB',
      }}
    >
      <p className="text-xs font-medium text-gray-500">{title}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1" style={{ color: color || '#111827' }}>
        {value}
      </p>
      {subtitle && <p className="text-xs text-gray-500 mt-1 font-medium">{subtitle}</p>}

      {sparklineData && (
        <div className="mt-3 h-[60px]">
          <ResponsiveContainer>
            <LineChart data={sparklineData}>
              <XAxis dataKey="label" hide />
              <YAxis hide />
              <Tooltip
                labelStyle={{ fontSize: 11 }}
                contentStyle={{
                  borderRadius: 8,
                  border: '1px solid #E5E7EB',
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={color || '#10B981'}
                strokeWidth={2.5}
                dot={{ r: 3, stroke: '#fff', strokeWidth: 1 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
