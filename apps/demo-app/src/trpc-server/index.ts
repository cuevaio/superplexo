import { publicProcedure, router } from "./trpc";

import { userProcedures } from "./procedures/users";
import { teamsProcedures } from "./procedures/projects";
export const appRouter = router({
  ...userProcedures,
  helloWorld: publicProcedure.query(async () => {
    return "Hello World!";
  }),
  ...teamsProcedures,
});

export type AppRouter = typeof appRouter;
