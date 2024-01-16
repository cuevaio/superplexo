import { publicProcedure, router } from "./trpc";

import { userProcedures } from "./procedures/users";

export const appRouter = router({
  ...userProcedures,
  helloWorld: publicProcedure.query(async ()=>{
      return "Hello World!";
  }),
})

export type AppRouter = typeof appRouter;
