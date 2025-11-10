// src/app/addons/(add-ons)/travel-dream-matcher/components/travel-dream-matcher-idea-card.tsx
'use client';

import * as React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Budget = 'low' | 'medium' | 'high';
type Duration = 'weekend' | '1-2_weeks' | '1_month' | 'flexible';

export interface TravelPlan {
  title: string;
  country: string;
  shortDescription: string;
  bestTime: string;
  budget: Budget;
  duration: Duration;
  topHighlights: string[]; // exactly 4
}

interface TravelPlanCardProps {
  plan: TravelPlan;
  index?: number;
  onOpenDialog?: (idea: { title: string; description: string; category: string }) => void;
}

const badgeClass =
  'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium bg-gray-50 text-gray-700 border-gray-200';

const labelClass = 'text-[11px] uppercase tracking-wide text-gray-400';

const TravelPlanCard = ({ plan, index, onOpenDialog }:TravelPlanCardProps) => {
  const { title, country, shortDescription, bestTime, budget, duration, topHighlights } = plan;

  const handleAdd = () => {
    // Map to your NewGoalDialog expected shape
    const description = [
      shortDescription,
      '',
      `Country: ${country}`,
      `Best time: ${bestTime}`,
      `Budget: ${budget}`,
      `Duration: ${duration}`,
      '',
      'Top highlights:',
      ...topHighlights.map((h, i) => `• ${h}`),
    ].join('\n');

    onOpenDialog?.({
      title,
      description,
      category: 'Travel', 
    });
  };

  return (
    <Card
      className="flex flex-col justify-between border border-gray-200 bg-white shadow-sm
                 hover:shadow-md hover:scale-[1.01] transition-transform duration-200 cursor-default"
    >
      <CardHeader className="pb-2">
        {typeof index === 'number' && (
          <span className="text-xs text-gray-400 mb-1 block">#{index + 1}</span>
        )}
        <CardTitle className="text-lg font-semibold text-gray-800 line-clamp-2">
          {title}
        </CardTitle>
        <CardDescription className="text-gray-600 text-sm line-clamp-3">
          {shortDescription}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <span className={badgeClass}>🏳️ {country}</span>
          <span className={badgeClass}>💰 {budget}</span>
          <span className={badgeClass}>⏱ {duration.replace('_', ' ')}</span>
          <span className={badgeClass}>🗓 {bestTime}</span>
        </div>

        <div>
          <div className={labelClass}>Top Highlights</div>
          <ul className="mt-1 list-disc pl-5 text-sm text-gray-700 space-y-1">
            {topHighlights.slice(0, 4).map((h, i) => (
              <li key={i} className="line-clamp-1">{h}</li>
            ))}
          </ul>
        </div>
      </CardContent>

      <CardFooter className="pt-0 flex justify-end">
        <Button onClick={handleAdd}>Add to List</Button>
      </CardFooter>
    </Card>
  );
};

export default TravelPlanCard;
