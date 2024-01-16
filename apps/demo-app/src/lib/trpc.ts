import { createTRPCReact } from "@trpc/react-query";
import { type AppRouter } from "@/trpc-server";

export const trpc: ReturnType<typeof createTRPCReact<AppRouter>> =
  createTRPCReact<AppRouter>({});
