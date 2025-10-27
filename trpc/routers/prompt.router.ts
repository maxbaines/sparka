import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  clearChatPrompt,
  createPrompt,
  deletePrompt,
  getPromptsByUserId,
  setChatPromptById,
  setChatPromptSnapshot,
  updatePrompt,
} from "@/lib/db/queries";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const promptRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await getPromptsByUserId({ userId: ctx.user.id });
  }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional().nullable(),
        content: z.string().min(1),
        variables: z.array(z.string()).optional().nullable(),
        tags: z.array(z.string()).optional().nullable(),
        visibility: z.enum(["public", "private"]).optional(),
        isPinned: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await createPrompt({ userId: ctx.user.id, ...input });
      return { success: true };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().optional(),
        description: z.string().optional().nullable(),
        content: z.string().optional(),
        variables: z.array(z.string()).optional().nullable(),
        tags: z.array(z.string()).optional().nullable(),
        visibility: z.enum(["public", "private"]).optional(),
        isPinned: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await updatePrompt({ userId: ctx.user.id, ...input });
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }
    }),

  remove: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await deletePrompt({ id: input.id, userId: ctx.user.id });
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }
    }),

  setChatPrompt: protectedProcedure
    .input(
      z.object({
        chatId: z.string().uuid(),
        promptId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await setChatPromptById({
          chatId: input.chatId,
          promptId: input.promptId,
          userId: ctx.user.id,
        });
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied or prompt not found",
        });
      }
    }),

  setChatPromptSnapshot: protectedProcedure
    .input(
      z.object({
        chatId: z.string().uuid(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await setChatPromptSnapshot({
          chatId: input.chatId,
          content: input.content,
          userId: ctx.user.id,
        });
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }
    }),

  clearChatPrompt: protectedProcedure
    .input(
      z.object({
        chatId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await clearChatPrompt({ chatId: input.chatId, userId: ctx.user.id });
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }
    }),
});
