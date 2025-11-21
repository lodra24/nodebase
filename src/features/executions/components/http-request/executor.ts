import Handlebars from "handlebars";
import type { NodeExecutor } from "@/features/executions/type";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";
import { httpRequestChannel } from "@/inngest/channels/http-request";

Handlebars.registerHelper("json", (context) =>
  JSON.stringify(context, null, 2)
);

type HttpRequestData = {
  variableName?: string;
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: string;
};

export const httpRequestExecutor: NodeExecutor<HttpRequestData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(httpRequestChannel().status({ nodeId, status: "loading" }));

  const { variableName, endpoint, method, body } = data;

  if (!endpoint) {
    await publish(httpRequestChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("HTTP Request Node: No endpoint configured");
  }

  if (!variableName) {
    await publish(httpRequestChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Variable name not configured");
  }

  try {
    const result = await step.run("http-request", async () => {
      const actualMethod = method || "GET";
      const actualEndpoint = Handlebars.compile(endpoint)(context);

      const options: KyOptions = { method: actualMethod };

      if (["POST", "PUT", "PATCH"].includes(actualMethod)) {
        const resolved = Handlebars.compile(body || "{}", { noEscape: true })(
          context
        );

        JSON.parse(resolved);

        options.body = resolved;
        options.headers = {
          "Content-Type": "application/json",
        };
      }

      const response = await ky(actualEndpoint, options);

      const contentType = response.headers.get("content-type");
      const responseData = contentType?.includes("application/json")
        ? await response.json()
        : await response.text();

      const responsePayload = {
        httpResponse: {
          status: response.status,
          statusText: response.statusText,
          data: responseData,
        },
      };

      return {
        ...context,
        [variableName]: responsePayload,
      };
    });

    await publish(httpRequestChannel().status({ nodeId, status: "success" }));

    return result;
  } catch (error) {
    await publish(httpRequestChannel().status({ nodeId, status: "error" }));

    throw error;
  }
};
//2:13:41'de kaldık
