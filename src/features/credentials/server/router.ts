import { db } from "@/lib/db";
import {
  createTRPCRouter,
  premiumProcedure,
  protectedProcedure,
} from "@/trpc/init";
import z from "zod";
import { PAGINATION } from "@/config/constants";
import { CredentialType } from "@prisma/client";

export const credentialRouter = createTRPCRouter({
  create: premiumProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        type: z.enum(CredentialType),
        value: z.string().min(1, "Value is required"),
      })
    )
    .mutation(({ ctx, input }) => {
      const { name, value, type } = input;
      return db.credential.create({
        data: {
          name,
          userId: ctx.auth.user.id,
          type,
          value,
        },
      });
    }),
  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return db.credential.delete({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
      });
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
        value: z.string().min(1),
        type: z.enum(CredentialType),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, name, type, value } = input;

      return db.credential.update({
        where: { id, userId: ctx.auth.user.id },
        data: {
          name,
          type,
          value,
        },
      });
    }),

  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return db.credential.findUniqueOrThrow({
        where: { id: input.id, userId: ctx.auth.user.id },
      });
    }),
  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().default(PAGINATION.DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(PAGINATION.MIN_PAGE_SIZE)
          .max(PAGINATION.MAX_PAGE_SIZE)
          .default(PAGINATION.DEFAULT_PAGE_SIZE),
        search: z.string().default(""),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search } = input;
      const [items, totalCount] = await Promise.all([
        db.credential.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          where: {
            userId: ctx.auth.user.id,
            name: { contains: search, mode: "insensitive" },
          },
          orderBy: {
            updatedAt: "desc",
          },
        }),
        db.credential.count({
          where: {
            userId: ctx.auth.user.id,
            name: { contains: search, mode: "insensitive" },
          },
        }),
      ]);
      const totalPages = Math.ceil(totalCount / pageSize);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;
      return {
        items,
        page,
        pageSize,
        totalCount,
        hasNextPage,
        hasPreviousPage,
        totalPages,
      };
    }),
  getByType: protectedProcedure
    .input(
      z.object({
        type: z.enum(CredentialType),
      })
    )
    .query(async ({ input, ctx }) => {
      const { type } = input;

      return db.credential.findMany({
        where: { type, userId: ctx.auth.user.id },
        orderBy: {
          updatedAt: "desc",
        },
      });
    }),
});
