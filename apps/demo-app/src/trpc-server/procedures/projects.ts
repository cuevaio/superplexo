import { z } from "zod";
import { protectedProcedure } from "../trpc";

import { getXataClient } from "@/lib/xata";
let xata = getXataClient();

export const teamsProcedures = {
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

  createTeam: protectedProcedure
    .input(
      z.object({
        teamName: z.string(),
        memberEmails: z.array(z.string().email()),
        projectSlugs: z.array(z.string()),
      })
    )
    .mutation(async (opts) => {
      const {
        input: { teamName, memberEmails, projectSlugs },
        ctx: { user },
      } = opts;

      let teamSlug: string =
        teamName.trim().replace(/\s+/g, "-").toLowerCase() +
        "-" +
        Math.random().toString(36).substring(2, 8);

      let [members, projects] = await Promise.all([
        xata.db.users.filter({ email: { $any: memberEmails } }).getAll(),
        xata.db.projects.filter({ slug: { $any: projectSlugs } }).getAll(),
      ]);

      let team = await xata.db.teams.create({
        name: teamName,
        slug: teamSlug,
      });

      await Promise.all([
        xata.db.team_member_rels.create(
          members.map((member) => {
            return {
              team: team.id,
              member: member.id,
            };
          })
        ),
        xata.db.team_project_rels.create(
          projects.map((project) => {
            return {
              team: team.id,
              project: project.id,
            };
          })
        ),
      ]);

      return team;
    }),
};
