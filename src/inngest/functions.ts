import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import { db } from "@/lib/db";
import { topologicalSort } from "./utils";
import { NodeType } from "@prisma/client";
import { getExecutor } from "@/features/executions/lib/executor-registry";
import { httpRequestChannel } from "./channels/http-request";
import { manualTriggerChannel } from "./channels/manual-trigger";
import { googleFormTriggerChannel } from "./channels/google-form-trigger";
import { stripeTriggerChannel } from "./channels/stripe-trigger";
import { geminiChannel } from "./channels/gemini";
import { openaiChannel } from "./channels/openai";
import { anthropicChannel } from "./channels/anthropic";
import { discordChannel } from "./channels/discord";
import { slackChannel } from "./channels/slack";

export const executeWorkflow = inngest.createFunction(
  {
    id: "execute-workflow",
    retries: process.env.NODE_ENV === "production" ? 3 : 0,
    onFailure: async ({ event }) => {
      const failedEventId = event.data.event.id;
      if (failedEventId) {
        await db.execution.update({
          where: {
            inngestEventId: failedEventId,
          },
          data: {
            status: "FAILED",
            error: event.data.error.message,
            errorStack: event.data.error.stack?.toString() || "",
            completedAt: new Date(),
          },
        });
      }
    },
  },
  {
    event: "workflows/execute.workflow",
    channels: [
      httpRequestChannel(),
      manualTriggerChannel(),
      googleFormTriggerChannel(),
      stripeTriggerChannel(),
      geminiChannel(),
      openaiChannel(),
      anthropicChannel(),
      discordChannel(),
      slackChannel(),
    ],
  },
  async ({ event, step, publish }) => {
    const workflowId = event.data.workflowId;
    const inngestEventId = event.id;

    if (!workflowId || !inngestEventId) {
      throw new NonRetriableError("Workflow Id or Event Id is missing!");
    }

    await step.run("create-execution", async () => {
      return db.execution.create({
        data: {
          workflowId,
          inngestEventId,
          status: "RUNNING",
          error: "",
          errorStack: "",
        },
      });
    });

    const sortedNodes = await step.run("prepare-workflow", async () => {
      const workflow = await db.workflow.findUniqueOrThrow({
        where: {
          id: workflowId,
        },
        include: {
          nodes: true,
          connections: true,
        },
      });
      return topologicalSort(workflow.nodes, workflow.connections);
    });

    const userId = await step.run("find-user-id", async () => {
      const workflow = await db.workflow.findUniqueOrThrow({
        where: { id: workflowId },
        select: {
          userId: true,
        },
      });

      return workflow.userId;
    });

    let context = event.data.initialData || {};

    for (const node of sortedNodes) {
      const executor = getExecutor(node.type as NodeType);
      context = await executor({
        data: node.data as Record<string, unknown>,
        nodeId: node.id,
        userId,
        context,
        step,
        publish,
      });
    }

    await step.run("update-execution-success", async () => {
      return db.execution.update({
        where: {
          inngestEventId,
        },
        data: {
          status: "SUCCESS",
          completedAt: new Date(),
          output: context,
        },
      });
    });

    return { workflowId, result: context };
  }
);
