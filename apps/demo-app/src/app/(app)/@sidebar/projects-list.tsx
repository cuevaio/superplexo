"use client";

import { trpc } from "@/lib/trpc";
import { TeamsRecord } from "@/lib/xata";
import { Button } from "@superplexo/ui/button";
import { ScrollArea } from "@superplexo/ui/scroll-area";
import { SelectedPick } from "@xata.io/client";
import { FolderKanbanIcon } from "lucide-react";

interface Props {
  initialData: Readonly<SelectedPick<TeamsRecord, ["*"]>>[]
}

export const ProjectsList = ({ initialData }: Props) => {
  let listAllProjects = trpc.listAllProjects.useQuery();
  let projects = listAllProjects.data || initialData || [];

  return (
    <ScrollArea className="h-[500px]">
      <div className="pr-4">
        {projects.map((project) => (
          <div key={project.id}>
            <Button
              variant="ghost"
              className="w-full h-min py-2 justify-start"
            >
              <FolderKanbanIcon className="w-4 h-4 mr-2 text-primary" />
              {project.name}
            </Button>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
