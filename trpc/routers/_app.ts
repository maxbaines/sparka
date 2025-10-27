import { createCallerFactory, createTRPCRouter } from "@/trpc/init";
import { chatRouter } from "./chat.router";
import { creditsRouter } from "./credits.router";
import { documentRouter } from "./document.router";
import { promptRouter } from "./prompt.router";
import { voteRouter } from "./vote.router";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */

export const appRouter = createTRPCRouter({
  chat: chatRouter,
  vote: voteRouter,
  document: documentRouter,
  credits: creditsRouter,
  prompt: promptRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
