export const runtime = 'edge';
export const preferredRegion = ['iad1'];

import { ProjectCombobox } from "@/components/project-combobox";
import { getXataClient } from "@/lib/xata";
import { Button } from "@superplexo/ui/button";
import { CopyIcon } from "lucide-react";
import { Members } from "./members";
import { notFound } from "next/navigation";

let xata = getXataClient();

interface Props {
  params: {
    slug: string;
  };
}

const TeamPage = async ({ params }: Props) => {
  let team = await xata.db.teams.filter({ slug: params.slug }).getFirst();
  if (!team) {
    return notFound();
  }

  return (
    <div className="flex h-full">
      <div className="grow p-4">
        Page {params.slug}
        <pre>
          <code>{JSON.stringify(team, null, 2)}</code>
        </pre>
      </div>
      <div className="flex-none w-96 border-l">
        <div className="flex items-center space-x-4 border-b p-4">
          <Button
            variant="outline"
            size="icon"
            className="text-muted-foreground"
          >
            <CopyIcon className="h-4 w-4" />
          </Button>
          <p className="text-sm text-muted-foreground">{team.slug}</p>
        </div>
        <div className="p-4 space-y-2">
          <div className="flex items-center space-x-4">
            <p className="text-sm w-20">Members</p>
            <Members
              teamSlug={params.slug}
              initialMembersCount={team.membersCount}
            />
          </div>
          <div className="flex items-center space-x-4">
            <p className="text-sm w-20">Projects</p>
            <ProjectCombobox multiple placeholder="Projects" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamPage;
