export const runtime = 'edge';
export const preferredRegion = ['iad1'];

import { notFound } from "next/navigation";
import { CopyIcon } from "lucide-react";
import { getXataClient } from "@/lib/xata";
import { Button } from "@superplexo/ui/button";
import { Members } from "./members";
import { TeamCombobox } from "@/components/team-combobox";

let xata = getXataClient();

interface Props {
  params: {
    slug: string;
  };
}

const ProjectPage = async ({ params }: Props) => {
  let project = await xata.db.projects.filter({ slug: params.slug }).getFirst();
  if (!project) {
    return notFound();
  }

  return (
    <div className="flex h-full">
      <div className="grow p-4">
        Page {params.slug}
        <pre>
          <code>{JSON.stringify(project, null, 2)}</code>
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
          <p className="text-sm text-muted-foreground">{project.slug}</p>
        </div>
        <div className="p-4 space-y-2">
          <div className="flex items-center space-x-4">
            <p className="text-sm w-20">Members</p>
            <Members
              projectSlug={params.slug}
              initialMembersCount={project.membersCount}
            />
          </div>
          <div className="flex items-center space-x-4">
            <p className="text-sm w-20">Teams</p>
            <TeamCombobox multiple placeholder="Teams" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;
