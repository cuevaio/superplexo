import { z } from "zod";
import { protectedProcedure } from "../trpc";

import { UsersRecord, getXataClient } from "@/lib/xata";
import { TRPCError } from "@trpc/server";
import { SelectedPick } from "@xata.io/client";
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
        input: {
          projectName,
          projectDescription,
          memberEmails,
          teamSlugs,
          leadEmail,
        },
      } = opts;

      let projectSlug: string =
        projectName.trim().replace(/\s+/g, "-").toLowerCase() +
        "-" +
        Math.random().toString(36).substring(2, 8);

      let [members, teams, lead] = await Promise.all([
        memberEmails?.length
          ? memberEmails.length > 0
            ? xata.db.users.filter({ email: { $any: memberEmails } }).getAll()
            : undefined
          : undefined,

        teamSlugs?.length
          ? teamSlugs.length > 0
            ? xata.db.teams.filter({ slug: { $any: teamSlugs } }).getAll()
            : undefined
          : undefined,

        leadEmail
          ? xata.db.users.filter({ email: leadEmail }).getFirst()
          : undefined,
      ]);

      let project = await xata.db.projects.create({
        name: projectName,
        description: projectDescription,
        slug: projectSlug,
        lead: lead?.id,
        membersCount: members?.length,
        teamsCount: teams?.length,
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
    let projects = await xata.db.projects.sort("name", "asc").getAll();
    return projects;
  }),

  listProjectMembers: protectedProcedure
    .input(z.object({ projectSlug: z.string() }))
    .query(async (opts) => {
      const {
        input: { projectSlug },
      } = opts;

      let project = await xata.db.projects.filter({ slug: projectSlug }).getFirst();
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      let memberships = await xata.db.project_member_rels
        .select(["member.*"])
        .filter({ project: project.id })
        .sort("member.name", "asc")
        .getAll();

      let users: Readonly<SelectedPick<UsersRecord, ["*"]>>[] = [];

      for (let membership of memberships) {
        if (membership.member) {
          users.push(
            membership.member as Readonly<SelectedPick<UsersRecord, ["*"]>>
          );
        }
      }
      return users;
    }),

  updateProjectMembers: protectedProcedure
    .input(
      z.object({
        projectSlug: z.string(),
        membersEmails: z.array(z.string().email()),
      })
    )
    .mutation(async (opts) => {
      const {
        input: { projectSlug, membersEmails },
      } = opts;

      let project = await xata.db.projects.filter({ slug: projectSlug }).getFirst();
      if (!project)
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });

      let actualMemberships = await xata.db.project_member_rels
        .select(["id", "member.id", "member.email"])
        .filter({ project: project.id })
        .getAll();

      let membershipsToRemove: string[] = []; // the ids of the memberships to remove

      for (let actualMembership of actualMemberships) {
        if (actualMembership.member) {
          let member = actualMembership.member as Readonly<
            SelectedPick<UsersRecord, ["id", "email"]>
          >;

          if (!member.email) continue;

          if (!membersEmails.includes(member.email)) {
            membershipsToRemove.push(actualMembership.id); // remove this membership
          }
        }
      }

      let membershipsToAdd: { member: string; project: string }[] = [];

      let emailsToAdd = membersEmails.filter(
        (email) =>
          !membershipsToRemove.includes(email) &&
          !actualMemberships.find((m) => m.member?.email == email)
      );

      let membersIdsToAdd = await xata.db.users
        .filter({ email: { $any: emailsToAdd } })
        .select(["id"])
        .getAll();
      for (let memberId of membersIdsToAdd) {
        membershipsToAdd.push({ project: project.id, member: memberId.id });
      }

      let deleted = membershipsToRemove.length > 0 ? await xata.db.project_member_rels.delete(membershipsToRemove) : [];
      let created = membershipsToAdd.length > 0 ? await xata.db.project_member_rels.create(membershipsToAdd) : [];

      let newMembersCount =
        actualMemberships.length - deleted.length + created.length;

      await project.update({ membersCount: newMembersCount });

      return true;
    }),
};
