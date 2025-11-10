
import { ChatOpenAI } from "@langchain/openai";

export const openaiModal = new ChatOpenAI({
  model: "gpt-4o",   
  temperature: 0.2,
  maxTokens: 1000,
  timeout: 30000,
});
