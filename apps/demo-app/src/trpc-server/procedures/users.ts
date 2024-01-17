import { z } from "zod";
import { protectedProcedure } from "../trpc";

import { getXataClient } from "@/lib/xata";
import { TRPCError } from "@trpc/server";
let xata = getXataClient();

export const userProcedures = {
  getUser: protectedProcedure.query(async (opts) => {
    const {
      ctx: { user },
    } = opts;
    return user;
  }),

  updateName: protectedProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .mutation(async (opts) => {
      const {
        input: { name },
        ctx: { user },
      } = opts;

      let updatedUser = await user.update({ name });

      return updatedUser;
    }),

  listUsers: protectedProcedure
    .input(
      z.object({
        page: z.number().nonnegative().default(1),
        size: z.number().nonnegative().default(20),
      })
    )
    .query(async (opts) => {
      const { input } = opts;

      let pageResult = await xata.db.users.getPaginated({
        consistency: "eventual",
        pagination: { size: input.size, offset: (input.page - 1) * input.size },
      });

      return pageResult;
    }),

  listAllUsers: protectedProcedure.query(async () => {
    let results = await xata.db.users.getAll();
    return results;
  }),

  searchUsers: protectedProcedure
    .input(
      z.object({
        query: z.string().default(""),
      })
    )
    .query(async (opts) => {
      const {
        input: { query },
      } = opts;

      if (!query) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Query cannot be empty",
        });
      }

      let search = await xata.db.users.search(query);

      return search;
    }),
};
