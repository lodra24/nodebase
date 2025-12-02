import Handlebars from "handlebars";
import type { NodeExecutor } from "@/features/executions/type";
import { NonRetriableError } from "inngest";
import ky from "ky";
import { discordChannel } from "@/inngest/channels/discord";
import { decode } from "html-entities";

Handlebars.registerHelper("json", (context) =>
  JSON.stringify(context, null, 2)
);

type DiscordData = {
  webhookUrl?: string;
  content?: string;
  username?: string;
  avatarUrl?: string;
};

export const discordExecutor: NodeExecutor<DiscordData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(discordChannel().status({ nodeId, status: "loading" }));

  if (!data.webhookUrl) {
    await publish(
      discordChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Discord node: Webhook URL is missing");
  }

  if (!data.content) {
    await publish(
      discordChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Discord node: Message content is missing");
  }

  const content = decode(Handlebars.compile(data.content)(context));
  const username = data.username
    ? decode(Handlebars.compile(data.username)(context))
    : undefined;
  const avatarUrl = data.avatarUrl
    ? Handlebars.compile(data.avatarUrl)(context)
    : undefined;

  try {
    await step.run("discord-send-message", async () => {
      try {
        await ky.post(data.webhookUrl!, {
          json: {
            content,
            username,
            avatar_url: avatarUrl,
          },
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Discord API Error";
        throw new NonRetriableError(errorMessage || "Discord API Error");
      }
    });

    await publish(
      discordChannel().status({
        nodeId,
        status: "success",
      })
    );

    return context;
  } catch (error) {
    await publish(
      discordChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw error;
  }
};
