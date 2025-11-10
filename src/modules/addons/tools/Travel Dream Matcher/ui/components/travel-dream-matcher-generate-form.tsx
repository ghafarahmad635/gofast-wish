
'use client';

import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { experimental_useObject as useObject } from '@ai-sdk/react';

import {
  Form, FormField, FormItem, FormLabel, FormControl,
  FormDescription, FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import {
  TravelGenerateInput,
  travelGenerateSchema,
  TravelPlans,
  travelPlansArraySchema,
} from '../../schema';


interface Props {
  onGenerate: (plans: TravelPlans) => void;
  toolID: string;
  onLoadingChange?: (loading: boolean) => void;
}

export default function TravelGenerateForm({ onGenerate, toolID, onLoadingChange }: Props) {
  const { object, submit, isLoading, stop, error } = useObject({
    api: '/api/travel-dream-matcher',  
    schema: travelPlansArraySchema,     
    credentials: 'include',             
  });

  const form = useForm<TravelGenerateInput>({
    resolver: zodResolver(travelGenerateSchema),
    defaultValues: {
      budgetRange: 'medium',
      tripDuration: 'flexible',
      travelStyle: 'balanced',
      preferredSeason: 'any',
      interestsNotes: '',
      responseCount: '3',
    },
  });

  useEffect(() => onLoadingChange?.(isLoading), [isLoading, onLoadingChange]);

  // Stream updates come as partial arrays — pass a shallow copy to trigger renders
  useEffect(() => {
    if (Array.isArray(object)) onGenerate(object as TravelPlans)
  }, [object, onGenerate]);

  useEffect(() => {
    if (error) toast.error('Stream failed');
  }, [error]);

  const responseCountItems = useMemo(() => [1, 2, 3, 4, 5, 6], []);

  const onSubmit = (v: TravelGenerateInput) => {
    const summary = `
Generate ${v.responseCount} destination suggestions using:
- Budget Range: ${v.budgetRange}
- Trip Duration: ${v.tripDuration}
- Travel Style: ${v.travelStyle}
- Preferred Season: ${v.preferredSeason}
- Interests & Activities: ${v.interestsNotes || 'N/A'}
    `.trim();

    submit({
      id: toolID,
      prompt: summary,
      count: Number(v.responseCount),
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField
            control={form.control}
            name="budgetRange"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Budget Range</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger className="border border-gray-300">
                    <SelectValue placeholder="Select budget" />
                  </SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>General budget level for planning.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tripDuration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trip Duration</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger className="border border-gray-300">
                    <SelectValue placeholder="Select trip duration" />
                  </SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="weekend">Weekend Only</SelectItem>
                    <SelectItem value="1-2_weeks">1 to 2 Weeks</SelectItem>
                    <SelectItem value="1_month">1 Month</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Typical time you want to allocate.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="travelStyle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Travel Style</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger className="border border-gray-300">
                    <SelectValue placeholder="Select travel style" />
                  </SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="relaxed">Relaxed</SelectItem>
                    <SelectItem value="balanced">Balanced</SelectItem>
                    <SelectItem value="fast_paced">Fast Paced</SelectItem>
                    <SelectItem value="luxury">Luxury</SelectItem>
                    <SelectItem value="budget">Budget</SelectItem>
                    <SelectItem value="adventure">Adventure</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>How you like to travel.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="preferredSeason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Season</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger className="border border-gray-300">
                    <SelectValue placeholder="Select season" />
                  </SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="spring">Spring</SelectItem>
                    <SelectItem value="summer">Summer</SelectItem>
                    <SelectItem value="autumn">Autumn</SelectItem>
                    <SelectItem value="winter">Winter</SelectItem>
                    <SelectItem value="any">Any Season</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Seasonal preference for trips.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="responseCount"
            render={({ field }) => (
              <FormItem className="sm:col-span-2 lg:col-span-1">
                <FormLabel>Number of Suggestions</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger className="border border-gray-300">
                    <SelectValue placeholder="Select number" />
                  </SelectTrigger></FormControl>
                  <SelectContent>
                    {responseCountItems.map((n) => (
                      <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>How many destinations to generate.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="interestsNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Interests and Activities</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Example: beaches, hiking, street food, museums, kid friendly"
                  className="min-h-[120px] border border-gray-300"
                  {...field}
                />
              </FormControl>
              <FormDescription>Short free text for interests and activities.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3 mt-2">
          <Button type="submit" disabled={isLoading} className="grow">
            {isLoading ? 'Generating…' : 'Generate Suggestions'}
          </Button>
          <Button type="button" variant="secondary" className="shrink-0" onClick={() => stop()} disabled={!isLoading}>
            Stop
          </Button>
        </div>
      </form>
    </Form>
  );
}
