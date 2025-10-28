import { inngest } from "@/inngest/client";
import { createTRPCRouter, protectedProcedure } from "../init";
import { db } from "@/lib/db";
import { TRPCError } from "@trpc/server";
export const appRouter = createTRPCRouter({
  testAi: protectedProcedure.mutation(async () => {
    await inngest.send({
      name: "execute/ai",
    });
  }),
  getWorkflows: protectedProcedure.query(({ ctx }) => {
    //we check it in the init.ts file whether if user authorize or not.
    return db.workflow.findMany();
  }),
  createWorkflows: protectedProcedure.mutation(async () => {
    await inngest.send({
      name: "test/hello.world",
      data: {
        email: "orhanbulbu@gmail.com",
      },
    });
    return { success: true, message: "Job queued" };
  }),
});
// export type definition of API
export type AppRouter = typeof appRouter;
