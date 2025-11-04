import z from "zod";

// ✅ Validation Schema
export const generateSchema = z.object({
  prompt: z.string().min(3, 'Please enter a valid prompt'),

  gender: z.enum(['male', 'female', 'other']),
  interests: z.array(z.string()).min(1, 'Select at least one interest'),

  budget: z.enum(['low', 'medium', 'high']),
  travelPreference: z.enum(['local', 'international', 'both']),
  availableTime: z.enum(['weekend', '1-2 weeks', '1 month', 'flexible']),

  responseCount: z.enum(['1', '2', '3', '4', '5', '6']),
})


export type GenerateInput = z.infer<typeof generateSchema>