import Handlebars from "handlebars";
import type { NodeExecutor } from "@/features/executions/type";
import { NonRetriableError } from "inngest";
import ky from "ky";
import { decode } from "html-entities";
import { slackChannel } from "@/inngest/channels/slack";

Handlebars.registerHelper("json", (context) =>
  JSON.stringify(context, null, 2)
);

type SlackData = {
  webhookUrl?: string;
  content?: string;
  username?: string;
  avatarUrl?: string;
};

export const slackExecutor: NodeExecutor<SlackData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(slackChannel().status({ nodeId, status: "loading" }));

  if (!data.webhookUrl) {
    await publish(
      slackChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Slack node: Webhook URL is missing");
  }

  if (!data.content) {
    await publish(
      slackChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Slack node: Message content is missing");
  }

  const content = decode(Handlebars.compile(data.content)(context));
  const username = data.username
    ? decode(Handlebars.compile(data.username)(context))
    : undefined;
  const avatarUrl = data.avatarUrl
    ? Handlebars.compile(data.avatarUrl)(context)
    : undefined;

  try {
    await step.run("slack-send-message", async () => {
      try {
        await ky.post(data.webhookUrl!, {
          json: {
            text: content, // Slack "text" kullanır
            username,
            icon_url: avatarUrl, // Slack "icon_url" kullanır
          },
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Slack API Error";
        throw new NonRetriableError(errorMessage);
      }
    });

    await publish(
      slackChannel().status({
        nodeId,
        status: "success",
      })
    );

    return context;
  } catch (error) {
    await publish(
      slackChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw error;
  }
};
