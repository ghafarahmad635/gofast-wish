'use client';
import React from 'react';
import { useTRPC } from '@/trpc/client';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ErrorState } from '@/components/error-state';
import { motion } from 'framer-motion';
import { Crown, Gauge, Target } from 'lucide-react';

const GoalStatusView = () => {
  const trpc = useTRPC();
  
  const { data } = useSuspenseQuery(trpc.goals.getMany.queryOptions({}));

  const totalGoals = data?.items?.length || 0;
  const completedGoals = data?.items?.filter((g: any) => g.isCompleted)?.length || 0;
  const progress = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

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
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-4 px-4 md:px-8">
      {cards.map((card, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          whileHover={{ scale: 1.03 }}
          className={`relative rounded-2xl p-8 shadow-lg text-white bg-gradient-to-br ${card.gradient} overflow-hidden cursor-pointer transition-transform`}
        >
          {/* Animated glowing background */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute w-[200%] h-[200%] -left-1/2 -top-1/2 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.15)_0%,transparent_60%),radial-gradient(circle_at_70%_70%,rgba(255,255,255,0.1)_0%,transparent_60%)] animate-slow-move" />
          </div>

          <div className="absolute right-5 top-5">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-sm">
              <card.icon size={28} />
            </div>
          </div>

          <h3 className="text-sm font-semibold uppercase tracking-wider opacity-90 mb-2 relative z-10">
            {card.title}
          </h3>

          <p className="text-6xl font-bold leading-tight mb-2 relative z-10">{card.value}</p>

          <p className="text-base opacity-90 font-medium relative z-10">{card.subtitle}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default GoalStatusView;

export const GoalsViewStatusLoadingState = () => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-4 px-4 md:px-8">
    {Array.from({ length: 3 }).map((_, i) => (
      <div
        key={i}
        className="animate-pulse rounded-2xl p-8 shadow-lg bg-white h-[190px] flex flex-col justify-center items-center"
      >
        <div className="w-14 h-14 bg-gray-300 rounded-full mb-4" />
        <div className="w-24 h-5 bg-gray-300 rounded mb-2" />
        <div className="w-16 h-4 bg-gray-300 rounded" />
      </div>
    ))}
  </div>
);

export const GoalsViewStatusErrorState = () => (
  <ErrorState
    title="Error Loading Goals"
    description="There was an error fetching your goals."
  />
);


