import { createCaller } from "@/server/routers/_app";
import { createTRPCContext } from "@/server/trpc";

export const api = createCaller;
export type { AppRouter } from "@/server/routers/_app";
export { createTRPCContext };
