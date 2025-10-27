import { db } from "@/lib/db";
import { inngest } from "./client";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("fetching", "5s");
    await step.sleep("transcribing", "5s");
    await step.sleep("sending-to-ai", "5s");
    await step.run("create-workflow", () => {
      return db.workflow.create({
        data: {
          name: "workflow-from-inngest",
        },
      });
    });
    return { message: `Hello ${event.data.email}!` };
  }
);
