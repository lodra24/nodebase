import Handlebars from "handlebars";
import type { NodeExecutor } from "@/features/executions/type";
import { NonRetriableError } from "inngest";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { openaiChannel } from "@/inngest/channels/openai";
import { db } from "@/lib/db";

Handlebars.registerHelper("json", (context) =>
  JSON.stringify(context, null, 2)
);

type OpenAIData = {
  variableName?: string;
  credentialId?: string;
  model?: string;
  systemPrompt?: string;
  userPrompt?: string;
};

export const openAIExecutor: NodeExecutor<OpenAIData> = async ({
  data,
  nodeId,
  userId,
  context,
  step,
  publish,
}) => {
  await publish(openaiChannel().status({ nodeId, status: "loading" }));

  if (!data.variableName) {
    await publish(
      openaiChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("OpenAI node: Variable name is missing");
  }

  if (!data.userPrompt) {
    await publish(
      openaiChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("OpenAI node: User prompt is missing");
  }

  if (!data.credentialId) {
    await publish(
      openaiChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("OpenAI node: Credential is required");
  }

  const systemPrompt = data.systemPrompt
    ? Handlebars.compile(data.systemPrompt)(context)
    : "You are a helpful assistant.";

  const credential = await step.run("get-credential", () => {
    return db.credential.findUnique({
      where: {
        id: data.credentialId,
        userId,
      },
    });
  });

  if (!credential) {
    throw new NonRetriableError("OpenAI node: Credential not found");
  }

  const openai = createOpenAI({
    apiKey: credential.value,
  });

  const userPrompt = Handlebars.compile(data.userPrompt || "")(context);

  try {
    const { steps } = await step.ai.wrap("openai-generate-text", generateText, {
      model: openai(data.model || "gpt-4o"),
      system: systemPrompt,
      prompt: userPrompt,
      experimental_telemetry: {
        isEnabled: true,
        recordInputs: true,
        recordOutputs: true,
      },
    });

    const text =
      steps[0].content[0].type === "text" ? steps[0].content[0].text : "";

    await publish(
      openaiChannel().status({
        nodeId,
        status: "success",
      })
    );

    return {
      ...context,
      [data.variableName]: {
        text,
      },
    };
  } catch (error) {
    await publish(
      openaiChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw error;
  }
};
