'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Crown, Gauge, Target } from 'lucide-react'

interface GoalsSummaryCardsProps {
  totalGoals: number
  completedGoals: number
  progress: number
}

const GoalsSummaryCards = ({ totalGoals, completedGoals, progress }: GoalsSummaryCardsProps) => {
  const cards = [
    {
      title: 'GOALS',
      value: totalGoals,
      subtitle: 'Ready to Explore',
      gradient: 'from-teal-400 to-blue-500',
      icon: Target,
    },
    {
      title: 'COMPLETED',
      value: completedGoals,
      subtitle: completedGoals > 0 ? 'Victory Achieved' : 'Keep Going!',
      gradient: 'from-amber-400 to-orange-500',
      icon: Crown,
    },
    {
      title: 'PROGRESS',
      value: `${progress}%`,
      subtitle: `${completedGoals}/${totalGoals || 1} Completed`,
      gradient: 'from-purple-500 to-pink-500',
      icon: Gauge,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {cards.map((card, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          whileHover={{ scale: 1.03 }}
          className={`relative rounded-2xl p-8 shadow-lg text-white bg-gradient-to-br ${card.gradient} overflow-hidden cursor-pointer transition-transform`}
        >
          {/* Animated background glow */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute w-[200%] h-[200%] -left-1/2 -top-1/2 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.15)_0%,transparent_60%),radial-gradient(circle_at_70%_70%,rgba(255,255,255,0.1)_0%,transparent_60%)] animate-slow-move" />
          </div>

          {/* Icon */}
          <div className="absolute right-5 top-5">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-sm">
              <card.icon size={28} />
            </div>
          </div>

          {/* Content */}
          <h3 className="text-sm font-semibold uppercase tracking-wider opacity-90 mb-2 relative z-10">
            {card.title}
          </h3>
          <p className="text-6xl font-bold leading-tight mb-2 relative z-10">{card.value}</p>
          <p className="text-base opacity-90 font-medium relative z-10">{card.subtitle}</p>
        </motion.div>
      ))}
    </div>
  )
}

export default GoalsSummaryCards
