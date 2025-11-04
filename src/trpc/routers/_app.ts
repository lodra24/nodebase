import { createTRPCRouter } from "../init";
import { workflowsRouter } from "@/features/workflows/server/router";
export const appRouter = createTRPCRouter({
  workflow: workflowsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
