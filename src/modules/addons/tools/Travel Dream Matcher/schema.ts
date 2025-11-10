import { z } from "zod";

export const travelGenerateSchema = z.object({
  budgetRange: z.enum(["low", "medium", "high"], { message: "Select a budget range" }),
  tripDuration: z.enum(["weekend", "1-2_weeks", "1_month", "flexible"], { message: "Select a trip duration" }),
  travelStyle: z.enum(
    ["relaxed", "balanced", "fast_paced", "luxury", "budget", "adventure"],
    { message: "Select a travel style" }
  ),
  preferredSeason: z.enum(["spring", "summer", "autumn", "winter", "any"], { message: "Select a season" }),
  interestsNotes: z.string().max(2000, "Please keep it under 2000 characters"),
  responseCount: z.enum(["1", "2", "3", "4", "5", "6"]),
});





export type TravelGenerateInput = z.infer<typeof travelGenerateSchema>




export const travelPlanItem = z.object({
  title: z
    .string()
    .min(2)
    .describe("Short destination title. 3–6 words. No emojis."),
  country: z
    .string()
    .min(2)
    .describe("Country name only, e.g. 'Japan'. No city, no region."),
  shortDescription: z
    .string()
    .min(10)
    .max(220)
    .describe("Concise overview in 1–2 sentences. Informative, no hype."),
  bestTime: z
    .string()
    .min(2)
    .describe(`When to go. Examples: 'April–June', 'Dec–Feb', 'Any'.`),
  budget: z
    .enum(["low", "medium", "high"])
    .describe(
      "Relative budget class for a typical traveler. Pick one of: low, medium, high."
    ),
  duration: z
    .enum(["weekend", "1-2_weeks", "1_month", "flexible"])
    .describe(
      "Typical trip length. Use the provided literals exactly: weekend | 1-2_weeks | 1_month | flexible."
    ),
  topHighlights: z
    .array(z.string().min(2).max(60))
    .length(4)
    .describe(
      "Exactly 4 short highlight bullets. Start with a noun phrase. No trailing periods."
    ),
});

export const travelPlansArraySchema = z.array(travelPlanItem);

export type TravelPlan = z.infer<typeof travelPlanItem>;
export type TravelPlans = z.infer<typeof travelPlansArraySchema>;





