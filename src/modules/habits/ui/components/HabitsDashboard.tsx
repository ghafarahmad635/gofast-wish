'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import type { HabitGetMany } from '../../types'
import HabitCard from './HabitCard'

type Props = { habits: HabitGetMany }

export default function HabitsDashboard({ habits }: Props) {
  return (
    <Card className='bg-transparent p-0'>
      

      <AnimatePresence mode="wait">
        <motion.div
          key="habits-grid"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="mt-6 grid sm:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {habits.length ? (
            habits.map((h) => (
              <HabitCard
              key={h.id}
              habit={h}
              mode={(h.frequency?.toLowerCase() as 'daily' | 'weekly' | 'monthly') || 'daily'}
            />
            ))
          ) : (
            <EmptyState label="No habits found for this filter." />
          )}
        </motion.div>
      </AnimatePresence>
    </Card>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="col-span-full text-center text-sm text-muted-foreground py-10">
      {label}
    </div>
  )
}
