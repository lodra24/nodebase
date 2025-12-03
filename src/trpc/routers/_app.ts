import { credentialRouter } from "@/features/credentials/server/router";
import { createTRPCRouter } from "../init";
import { workflowsRouter } from "@/features/workflows/server/router";
import { executionsRouter } from "@/features/executions/server/router";
export const appRouter = createTRPCRouter({
  workflow: workflowsRouter,
  credentials: credentialRouter,
  executions: executionsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
