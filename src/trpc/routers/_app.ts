import { createTRPCRouter, protectedProcedure } from "../init";
import { db } from "@/lib/db";
export const appRouter = createTRPCRouter({
  getUsers: protectedProcedure.query(({ ctx }) => {
    //we check it in the init.ts file whether if user authorize or not.
    return db.user.findMany({
      where: {
        id: ctx.auth.user.id,
      },
    });
  }),
});
// export type definition of API
export type AppRouter = typeof appRouter;
