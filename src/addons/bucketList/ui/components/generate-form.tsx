'use client';

import React, { useEffect, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GenerateInput, generateSchema } from '../../schema';
import { toast } from 'sonner';
import { useBucketIdeas } from '@/hooks/bucket-list/useBucketIdeas';

interface Props {
  onGenerate: (ideas: any[]) => void;
  toolID: string;
  onLoadingChange?: (loading: boolean) => void;
}

const interestOptions = [
  'Adventure',
  'Culture',
  'Food',
  'Nature',
  'History',
  'Sports',
  'Technology',
  'Relaxation',
] as const;

export default function GenerateForm({ onGenerate, toolID, onLoadingChange }: Props) {
  const { object, submit, isLoading, stop, error } = useBucketIdeas();

  const form = useForm<GenerateInput>({
    resolver: zodResolver(generateSchema),
    defaultValues: {
      prompt: '',
      gender: 'other',
      interests: [],
      budget: 'medium',
      travelPreference: 'both',
      availableTime: 'flexible',
      responseCount: '3',
    },
  });

  // reflect loading to parent
  useEffect(() => {
    onLoadingChange?.(isLoading);
  }, [isLoading, onLoadingChange]);

  // stream updates arrive as partial arrays
  useEffect(() => {
    if (object) onGenerate(object);
  }, [object, onGenerate]);

  useEffect(() => {
    if (error) toast.error('Stream failed');
  }, [error]);

  const responseCountItems = useMemo(() => [1, 2, 3, 4, 5, 6], []);

  const toggleInterest = useCallback(
    (label: typeof interestOptions[number], checked: boolean) => {
      const curr = form.getValues('interests');
      if (checked && !curr.includes(label)) {
        form.setValue('interests', [...curr, label], { shouldDirty: true });
      } else if (!checked && curr.includes(label)) {
        form.setValue(
          'interests',
          curr.filter((i) => i !== label),
          { shouldDirty: true }
        );
      }
    },
    [form]
  );

  const onSubmit = (values: GenerateInput) => {
    const combinedPrompt = `
Generate ${values.responseCount} bucket list ideas based on:
- Prompt: ${values.prompt}
- Gender: ${values.gender}
- Interests: ${values.interests.join(', ') || 'None'}
- Budget: ${values.budget}
- Travel Preference: ${values.travelPreference}
- Available Time: ${values.availableTime}
    `.trim();

    submit({
      id: toolID,
      prompt: combinedPrompt,
      count: Number(values.responseCount),
    });
  };

  // watch once to avoid re-renders per checkbox
  const selectedInterests = form.watch('interests');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="prompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prompt</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Adventure goals for 2025..."
                  {...field}
                  className="border border-gray-300"
                />
              </FormControl>
              <FormDescription>Describe your bucket list idea or theme.</FormDescription>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="border border-gray-300">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="budget"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Budget Range</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="border border-gray-300">
                      <SelectValue placeholder="Select budget" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="travelPreference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Travel Preference</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="border border-gray-300">
                      <SelectValue placeholder="Select preference" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="local">Local Trips</SelectItem>
                    <SelectItem value="international">International</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="availableTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Available Time</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="border border-gray-300">
                      <SelectValue placeholder="Select available time" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="weekend">Weekend Only</SelectItem>
                    <SelectItem value="1-2 weeks">1–2 Weeks</SelectItem>
                    <SelectItem value="1 month">1 Month</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="responseCount"
            render={({ field }) => (
              <FormItem className="sm:col-span-2 lg:col-span-1">
                <FormLabel>Number of Responses</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="border border-gray-300">
                      <SelectValue placeholder="Select number" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {responseCountItems.map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="interests"
          render={() => (
            <FormItem>
              <FormLabel>Interests and Hobbies</FormLabel>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-2">
                {interestOptions.map((label) => {
                  const checked = selectedInterests.includes(label);
                  return (
                    <label key={label} className="flex items-center space-x-2">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(c) => toggleInterest(label, Boolean(c))}
                      />
                      <span>{label}</span>
                    </label>
                  );
                })}
              </div>
            </FormItem>
          )}
        />

        <div className="flex gap-3 mt-2">
          <Button type="submit" disabled={isLoading} className="grow">
            {isLoading ? 'Generating ideas…' : 'Generate Ideas'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="shrink-0"
            onClick={() => stop()}
            disabled={!isLoading}
          >
            Stop
          </Button>
        </div>
      </form>
    </Form>
  );
}
