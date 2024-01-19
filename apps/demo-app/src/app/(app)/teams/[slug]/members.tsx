"use client";
import { UserCombobox } from "@/components/user-combobox";
import { trpc } from "@/lib/trpc";

import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { toast } from "sonner";

interface Props {
  teamSlug: string;
  initialMembersCount: number;
}

export const Members = ({ initialMembersCount, teamSlug }: Props) => {
  let listTeamMembers = trpc.listTeamMembers.useQuery({ teamSlug });
  let queryClient = useQueryClient();
  let listTeamMembersKey = getQueryKey(trpc.listTeamMembers, { teamSlug });

  let updateTeamMembers = trpc.updateTeamMembers.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries(listTeamMembersKey);
      toast.success("Members updated");
    },
  });

  return (
    <UserCombobox
      multiple
      placeholder="Members"
      initialUsers={listTeamMembers.data}
      initialUsersCount={initialMembersCount}
      handleOnClose={(usersEmails) =>
        updateTeamMembers.mutate({ teamSlug, membersEmails: usersEmails })
      }
    />
  );
};
