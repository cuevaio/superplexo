import { z } from "zod";
import { protectedProcedure } from "../trpc";

import { getXataClient } from "@/lib/xata";
let xata = getXataClient();

export const teamsProcedures = {
  createTeam: protectedProcedure
    .input(
      z.object({
        teamName: z.string(),
        memberEmails: z.array(z.string().email()).optional(),
        projectSlugs: z.array(z.string()).optional(),
      })
    )
    .mutation(async (opts) => {
      const {
        input: { teamName, memberEmails, projectSlugs },
      } = opts;

      let teamSlug: string =
        teamName.trim().replace(/\s+/g, "-").toLowerCase() +
        "-" +
        Math.random().toString(36).substring(2, 8);

      let [members, projects] = await Promise.all([
        memberEmails?.length &&
        memberEmails.length > 0 &&
        xata.db.users.filter({ email: { $any: memberEmails } }).getAll(),
        projectSlugs?.length &&
        projectSlugs.length > 0 &&
        xata.db.projects.filter({ slug: { $any: projectSlugs } }).getAll(),
      ]);

      let team = await xata.db.teams.create({
        name: teamName,
        slug: teamSlug,
      });

      await Promise.all([
        members &&
        xata.db.team_member_rels.create(
          members.map((member) => {
            return {
              team: team.id,
              member: member.id,
            };
          })
        ),
        projects &&
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

  listAllTeams: protectedProcedure
    .query(async () => {
      return await xata.db.teams.getAll();
    }
    )
};
