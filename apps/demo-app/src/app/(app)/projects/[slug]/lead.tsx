"use client";
import { UserCombobox } from "@/components/user-combobox";
import { trpc } from "@/lib/trpc";
import { UsersRecord } from "@/lib/xata";

import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { SelectedPick } from "@xata.io/client";
import { toast } from "sonner";

interface Props {
  projectSlug: string;
  initialLead?: Readonly<SelectedPick<UsersRecord, ["*"]>>;
}

export const Lead = ({ initialLead, projectSlug }: Props) => {
  let getProjectLead = trpc.getProjectLead.useQuery({ projectSlug });
  let queryClient = useQueryClient();
  let getProjectLeadKey = getQueryKey(trpc.getProjectLead, {
    projectSlug,
  });

  let updateProjectLead = trpc.updateProjectLead.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries(getProjectLeadKey);
      toast.success("Lead updated");
    },
  });

  return (
    <UserCombobox
      placeholder="Lead"
      initialUser={getProjectLead.data || initialLead}
      handleOnClose={(userEmail) =>
        updateProjectLead.mutate({ projectSlug, leadEmail: userEmail })
      }
    />
  );
};
