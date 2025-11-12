import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export const runtime = "edge"; // optional

export async function POST(req: Request) {
  const data = await req.json(); // all fields from the form

  // Build a clean prompt from the form data
  const {
    goal = "",
    wish_importance = "",
    wish_impact = "",
    wish_obstacles = "",
    wish_duration = "",
    wish_success = "",
    wish_deadline = "",
    wish_small_step = "",
  } = data || {};

  const prompt = `
You are Wish Clarity Coach. Turn the user answers into a clear details plan and give them clear and honest suggestion.

Wish
${goal}

Why it matters
${wish_importance}

Impact if achieved
${wish_impact}

Obstacles
${wish_obstacles}

Timeframe history
${wish_duration}

Definition of success
${wish_success}

Target deadline
${wish_deadline}

First small step
${wish_small_step}

Produce a short plan:
1. One sentence summary of the wish
2. Three most important drivers in plain language
3. Top three blockers with one action for each
4. Milestones with an order of execution
5. A clear first step for this week
Keep it under 1500 words. Use short lines. No fluff.
`.trim();

  const result = streamText({
    model: openai("gpt-4o"),
    system: "You are a expert  and practical planning assistant.",
    prompt,
  });

  // Streams text to the client
  return result.toTextStreamResponse();
}
