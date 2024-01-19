"use client";

import { trpc } from "@/lib/trpc";
import { ProjectsRecord } from "@/lib/xata";
import { Button } from "@superplexo/ui/button";
import { ScrollArea } from "@superplexo/ui/scroll-area";
import { SelectedPick } from "@xata.io/client";
import { FolderKanbanIcon } from "lucide-react";
import { CreateProject } from "./create-project";

interface Props {
  initialData: Readonly<SelectedPick<ProjectsRecord, ["*"]>>[];
}

export const ProjectsList = ({ initialData }: Props) => {
  let listAllProjects = trpc.listAllProjects.useQuery();
  let projects = listAllProjects.data || initialData || [];

  return (
    <>
      <CreateProject />
      <ScrollArea className="h-[500px]">
        <div className="pr-4">
          {projects
            .sort((a, b) => {
              if (!a.name) return 1;
              if (!b.name) return -1;
              return a.name.localeCompare(b.name);
            })
            .map((project) => (
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
    </>
  );
};
