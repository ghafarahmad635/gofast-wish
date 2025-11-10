import { NextResponse } from "next/server";
import { streamObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { db } from "@/lib/prisma";
import { bucketListIdeaItem } from "@/lib/ai/schemas/bucketListSchema";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 30;

const Body = z.object({
  id: z.uuid(),
  prompt: z.string().min(3),
  count: z.number().min(1).max(20).default(3),
  
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { id, prompt, count } = parsed.data;

  // Optional auth here

  const addon = await db.addOn.findUnique({
    where: { id },
    select: {
      name: true,
      systemPrompt: true,
      customPrompt: true,
      defaultCount: true,
      isEnabled: true,
    },
  });



  if (!addon) return NextResponse.json({ error: "Add-on not found" }, { status: 404 });
  if (!addon.isEnabled) return NextResponse.json({ error: "Add-on disabled" }, { status: 403 });

  const effectiveCount = Number.isFinite(count) ? count : addon.defaultCount ?? 3;

  // Server owns the system prompt. You can allow client override by falling back to `system ?? ...`
  const systemPrompt =
    addon.systemPrompt ||
    `You are ${addon.name}, a helpful assistant generating creative bucket list ideas.`;

  const effectivePrompt = addon.customPrompt
    ? `${prompt}\n\nContext:\n${addon.customPrompt}`
    : prompt;
  
  const result = streamObject({
    model: openai("gpt-4o"), // or your aiModel from @/lib/ai
    output: "array",
    schema: bucketListIdeaItem, // single item schema
    system: `${systemPrompt}\nAlways return exactly ${effectiveCount} items.`,
    prompt: effectivePrompt,
  });

  return result.toTextStreamResponse();
}
