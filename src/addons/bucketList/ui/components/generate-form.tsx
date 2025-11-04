'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useTRPC } from '@/trpc/client'
import { useMutation } from '@tanstack/react-query'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GenerateInput, generateSchema } from '../../schema'
import { toast } from 'sonner'

// ✅ PROPS
interface Props {
  onGenerate: (ideas: any[]) => void
  toolID: string,
   onLoadingChange?: (loading: boolean) => void
}

export default function GenerateForm({ onGenerate, toolID,onLoadingChange }: Props) {
  const trpc = useTRPC()

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
  })

  const generateIdeas = useMutation(
    trpc.bucketListRouter.generateIdeas.mutationOptions({
      onMutate: () => {
        onLoadingChange?.(true) // tell parent loading started
      },
      onSuccess: (data) => {
        onLoadingChange?.(false)
        onGenerate(data)
        toast.success("Ideas generated successfully!")
      },
      onError: () => {
        onLoadingChange?.(false)
        toast.error("Failed to generate ideas.")
      },
    })
  )


  const onSubmit = (values: GenerateInput) => {
    const combinedPrompt = `
      Generate ${values.responseCount} bucket list ideas based on:
      - Prompt: ${values.prompt}
      - Gender: ${values.gender}
      - Interests: ${values.interests.join(', ') || 'None'}
      - Budget: ${values.budget}
      - Travel Preference: ${values.travelPreference}
      - Available Time: ${values.availableTime}
    `

    generateIdeas.mutate({
      id: toolID,
      prompt: combinedPrompt,
      count: Number(values.responseCount), 
    })
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
  ]

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 "
      >
        {/* Prompt */}
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
              <FormDescription>
                Describe your bucket list idea or theme.
              </FormDescription>
            </FormItem>
          )}
        />

        {/* Dropdown Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Gender */}
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

          {/* Budget */}
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

          {/* Travel Preference */}
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

          {/* Available Time */}
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

          {/* Number of Responses */}
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
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <SelectItem key={num} value={String(num)}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        {/* Interests */}
        <FormField
          control={form.control}
          name="interests"
          render={() => (
            <FormItem>
              <FormLabel>Interests & Hobbies</FormLabel>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-2">
                {interestOptions.map((interest) => (
                  <label key={interest} className="flex items-center space-x-2">
                    <Checkbox
                      checked={form.watch('interests').includes(interest)}
                      onCheckedChange={(checked) => {
                        const current = form.getValues('interests')
                        if (checked)
                          form.setValue('interests', [...current, interest])
                        else
                          form.setValue(
                            'interests',
                            current.filter((i) => i !== interest)
                          )
                      }}
                    />
                    <span>{interest}</span>
                  </label>
                ))}
              </div>
            </FormItem>
          )}
        />

        {/* Submit */}
        <Button
          type="submit"
          disabled={generateIdeas.isPending}
          className="w-full mt-4"
        >
          {generateIdeas.isPending ? 'Generating...' : 'Generate Ideas'}
        </Button>
      </form>
    </Form>
  )
}
