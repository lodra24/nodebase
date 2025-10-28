import { db } from "@/lib/db";
import { inngest } from "./client";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

const google = createGoogleGenerativeAI({});

export const helloWorld = inngest.createFunction(
  { id: "execute-ai" },
  { event: "execute/ai" },
  async ({ event, step }) => {
    const { steps } = await step.ai.wrap("gemini-generate-text", generateText, {
      model: google("gemini-2.5-flash"),
      system: "You are a helpful assistant.",
      prompt: "What's 2+2?",
    });
    return steps;
  }
);
