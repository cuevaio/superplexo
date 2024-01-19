import { z } from "zod";
import { protectedProcedure } from "../trpc";

import { UsersRecord, getXataClient } from "@/lib/xata";
import { TRPCError } from "@trpc/server";
import { SelectedPick } from "@xata.io/client";
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
        memberEmails?.length
          ? memberEmails.length > 0
            ? xata.db.users.filter({ email: { $any: memberEmails } }).getAll()
            : undefined
          : undefined,
        projectSlugs?.length
          ? projectSlugs.length > 0
            ? xata.db.projects.filter({ slug: { $any: projectSlugs } }).getAll()
            : undefined
          : undefined,
      ]);

      let team = await xata.db.teams.create({
        name: teamName,
        slug: teamSlug,
        membersCount: members?.length,
        projectsCount: projects?.length,
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

      return team.slug;
    }),

  listAllTeams: protectedProcedure.query(async () => {
    return await xata.db.teams.sort("name", "asc").getAll();
  }),

  getTeam: protectedProcedure
    .input(z.object({ teamSlug: z.string() }))
    .query(async (opts) => {
      const {
        input: { teamSlug },
      } = opts;

      let team = await xata.db.teams.filter({ slug: teamSlug }).getFirst();
      if (!team) throw new TRPCError({ code: "NOT_FOUND" });

      return team;
    }),

  listTeamMembers: protectedProcedure
    .input(z.object({ teamSlug: z.string() }))
    .query(async (opts) => {
      const {
        input: { teamSlug },
      } = opts;

      let team = await xata.db.teams.filter({ slug: teamSlug }).getFirst();
      if (!team) throw new TRPCError({ code: "NOT_FOUND" });

      let memberships = await xata.db.team_member_rels
        .select(["member.*"])
        .filter({ team: team.id })
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

  updateTeamMembers: protectedProcedure
    .input(
      z.object({
        teamSlug: z.string(),
        membersEmails: z.array(z.string().email()),
      })
    )
    .mutation(async (opts) => {
      const {
        input: { teamSlug, membersEmails },
      } = opts;

      let team = await xata.db.teams.filter({ slug: teamSlug }).getFirst();
      if (!team)
        throw new TRPCError({ code: "NOT_FOUND", message: "Team not found" });

      let actualMemberships = await xata.db.team_member_rels
        .select(["id", "member.id", "member.email"])
        .filter({ team: team.id })
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

      let membershipsToAdd: { team: string; member: string }[] = [];

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
        membershipsToAdd.push({ team: team.id, member: memberId.id });
      }

      let deleted = membershipsToRemove
        ? await xata.db.team_member_rels.delete(membershipsToRemove)
        : [];
      let created = membershipsToAdd
        ? await xata.db.team_member_rels.create(membershipsToAdd)
        : [];

      let newMembersCount =
        actualMemberships.length - deleted.length + created.length;

      await team.update({ membersCount: newMembersCount });

      return true;
    }),
};
