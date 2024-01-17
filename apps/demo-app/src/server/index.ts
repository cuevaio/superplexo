import { publicProcedure, router } from "./trpc";

import { userProcedures } from "./procedures/users";
import { teamsProcedures } from "./procedures/teams";
import { projectsProcedures } from "./procedures/projects";

export const appRouter = router({
  helloWorld: publicProcedure.query(async () => {
    return "Hello World!";
  }),
  ...userProcedures,
  ...teamsProcedures,
  ...projectsProcedures,
});

export type AppRouter = typeof appRouter;
