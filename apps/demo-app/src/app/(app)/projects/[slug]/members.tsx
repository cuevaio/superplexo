"use client";
import { UserCombobox } from "@/components/user-combobox";
import { trpc } from "@/lib/trpc";

import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { toast } from "sonner";

interface Props {
  projectSlug: string;
  initialMembersCount: number;
}

export const Members = ({ initialMembersCount, projectSlug }: Props) => {
  let listProjectMembers = trpc.listProjectMembers.useQuery({ projectSlug });
  let queryClient = useQueryClient();
  let listProjectMembersKey = getQueryKey(trpc.listProjectMembers, {
    projectSlug,
  });

  let updateProjectMembers = trpc.updateProjectMembers.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries(listProjectMembersKey);
      toast.success("Members updated");
    },
  });

  return (
    <UserCombobox
      multiple
      placeholder="Members"
      initialUsers={listProjectMembers.data}
      initialUsersCount={initialMembersCount}
      handleOnClose={(usersEmails) =>
        updateProjectMembers.mutate({ projectSlug, membersEmails: usersEmails })
      }
    />
  );
};
