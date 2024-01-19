"use client";

import { trpc } from "@/lib/trpc";
import { ProjectsRecord } from "@/lib/xata";
import { Button } from "@superplexo/ui/button";
import { ScrollArea } from "@superplexo/ui/scroll-area";
import { SelectedPick } from "@xata.io/client";
import { FolderKanbanIcon } from "lucide-react";
import { CreateProject } from "./create-project";
import Link from "next/link";

interface Props {
  initialData: Readonly<SelectedPick<ProjectsRecord, ["*"]>>[];
}

export const ProjectsList = ({ initialData }: Props) => {
  let listAllProjects = trpc.listAllProjects.useQuery();
  let projects = listAllProjects.data || initialData || [];

  return (
    <>
      <CreateProject />
      <ScrollArea className="h-[500px] w-full -mx-2">
        <div className="w-full px-2 py-1 space-y-1">
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
                  className="w-[90%] h-8 justify-start"
                  asChild
                >
                  <Link href={`/projects/${project.slug}`}>
                    <FolderKanbanIcon className="w-4 h-4 mr-2 text-primary" />
                    <span>
                      {project.name.length > 20
                        ? project.name.slice(0, 18) + "..."
                        : project.name}
                    </span>
                  </Link>
                </Button>
              </div>
            ))}
        </div>
      </ScrollArea>
    </>
  );
};
