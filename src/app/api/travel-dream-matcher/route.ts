import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { streamObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { db } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { travelPlanItem } from "@/modules/addons/tools/Travel Dream Matcher/schema";

export const runtime = "nodejs";
export const maxDuration = 90;

const Body = z.object({
  id: z.string().min(1),             
  prompt: z.string().min(3),
  count: z.coerce.number().min(1).max(20).default(3),
});

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { id, prompt, count } = parsed.data;

  const addon = await db.addOn.findUnique({
    where: { id },
    select: { name:true, systemPrompt:true, customPrompt:true, defaultCount:true, isEnabled:true },
  });
  if (!addon) return NextResponse.json({ error: "Add-on not found" }, { status: 404 });
  if (!addon.isEnabled) return NextResponse.json({ error: "Add-on disabled" }, { status: 403 });

  const effectiveCount = Number.isFinite(count) ? count : addon.defaultCount ?? 3;

  const system =
    (addon.systemPrompt ?? `You are ${addon.name}.`)
  const userPrompt = addon.customPrompt ? `${prompt}\n\nContext:\n${addon.customPrompt}` : prompt;

  const result = streamObject({
    model: openai("gpt-4o"),
    output: "array",          
    schema: travelPlanItem,  
    system:`${system} \nAlways return exactly ${effectiveCount} items.`,
    prompt: userPrompt,
  });

  return result.toTextStreamResponse(); // chunked streaming response
}
