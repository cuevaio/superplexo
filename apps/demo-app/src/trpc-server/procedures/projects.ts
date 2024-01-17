import { z } from "zod";
import { protectedProcedure } from "../trpc";

import { getXataClient } from "@/lib/xata";
let xata = getXataClient();

export const projectsProcedures = {
  createProject: protectedProcedure
    .input(
      z.object({
        projectName: z.string(),
        projectDescription: z.string().optional(),
        memberEmails: z.array(z.string().email()).optional(),
        teamSlugs: z.array(z.string()).optional(),
        leadEmail: z.string().email().optional(),
      })
    )
    .mutation(async (opts) => {
      const {
        input: { projectName, projectDescription, memberEmails, teamSlugs, leadEmail },
      } = opts;

      let projectSlug: string =
        projectName.trim().replace(/\s+/g, "-").toLowerCase() +
        "-" +
        Math.random().toString(36).substring(2, 8);

      let [members, teams, lead] = await Promise.all([
        memberEmails?.length ?
          memberEmails.length > 0 ?
            xata.db.users.filter({ email: { $any: memberEmails } }).getAll() : undefined : undefined,

        teamSlugs?.length ?
          teamSlugs.length > 0 ?
            xata.db.teams.filter({ slug: { $any: teamSlugs } }).getAll() : undefined : undefined,

        leadEmail ?
          xata.db.users.filter({ email: leadEmail }).getFirst() : undefined
      ]);

      let project = await xata.db.projects.create({
        name: projectName,
        description: projectDescription,
        slug: projectSlug,
        lead: lead?.id
      });

      await Promise.all([
        members &&
        xata.db.project_member_rels.create(
          members.map((member) => {
            return {
              project: project.id,
              member: member.id,
            };
          })
        ),
        teams &&
        xata.db.team_project_rels.create(
          teams.map((team) => {
            return {
              team: team.id,
              project: project.id,
            };
          })
        ),
      ]);

      return project;
    }),

  listAllProjects: protectedProcedure.query(async () => {
    let projects = await xata.db.projects
      .sort("name", "asc")
      .getAll();
    return projects;
  }),
};
