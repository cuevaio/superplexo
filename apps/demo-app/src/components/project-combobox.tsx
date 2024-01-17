"use client";

import * as React from "react";
import { Check, FolderKanbanIcon, LayoutGridIcon } from "lucide-react";

import { cn } from "@superplexo/utils";
import { Button } from "@superplexo/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@superplexo/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@superplexo/ui/popover";
import { trpc } from "@/lib/trpc";
import { ScrollArea } from "@superplexo/ui/scroll-area";

interface Props {
  placeholder: string;
  multiple?: boolean;
}

export function ProjectCombobox(props: Props) {
  const [open, setOpen] = React.useState(false);
  let [selectedSlugs, setSelectedSlugs] = React.useState<string[]>([]);

  let listAllProjects = trpc.listAllProjects.useQuery();
  let projects =
    listAllProjects.data?.sort((a, b) => {
      if (!a.name) return 1;
      if (!b.name) return -1;
      return a.name.localeCompare(b.name);
    }) || [];

  let selectedProjects = projects
    .filter((project) => project.slug && selectedSlugs.includes(project.slug))
    .sort((a, b) => {
      if (!a.name) return 1;
      if (!b.name) return -1;
      return a.name.localeCompare(b.name);
    });

  let placeholder = props.placeholder;
  if (selectedProjects.length === 1) {
    placeholder = selectedProjects[0]?.name || placeholder;
  } else {
    if (selectedProjects.length > 0) {
      if (props.multiple) {
        placeholder = `${selectedProjects.length} projects`;
      }
    }
  }

  let Icon = props.multiple ? LayoutGridIcon : FolderKanbanIcon;

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          role="combobox"
          aria-expanded={open}
          className="text-muted-foreground w-min justify-between tabular-nums py-1 h-min"
        >
          <Icon className="h-4 w-4 shrink-0 mr-2" />
          {placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <Command>
          <CommandInput className="" placeholder="Search project..." />
          <CommandList className="">
            <ScrollArea className="h-64">
              <CommandEmpty>No project found.</CommandEmpty>
              <CommandGroup>
                {selectedProjects.map(
                  (project) =>
                    project.slug &&
                    project.name && (
                      <CommandItem
                        key={project.slug}
                        value={project.name}
                        onChange={() => {}}
                        onSelect={() => {
                          setSelectedSlugs(
                            selectedSlugs.filter((e) => e !== project.slug)
                          );
                        }}
                      >
                        <Check className={cn("mr-2 h-4 w-4")} />
                        {project.name}
                      </CommandItem>
                    )
                )}
                {projects.map(
                  (project) =>
                    project.name &&
                    project.slug &&
                    !selectedSlugs.includes(project.slug) && (
                      <CommandItem
                        key={project.slug}
                        value={project.name}
                        onChange={() => {}}
                        onSelect={() => {
                          if (!project.slug) return;
                          if (selectedSlugs.includes(project.slug)) {
                            setSelectedSlugs(
                              selectedSlugs.filter((e) => e !== project.slug)
                            );
                          } else {
                            if (props.multiple) {
                              setSelectedSlugs([
                                ...selectedSlugs,
                                project.slug,
                              ]);
                            } else {
                              setSelectedSlugs([project.slug]);
                            }
                          }
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedSlugs.includes(project.slug)
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {project.name}
                      </CommandItem>
                    )
                )}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
      <div className="hidden">
        <input
          name="projects"
          value={
            selectedSlugs.length && selectedSlugs.length > 0
              ? selectedSlugs.join(",")
              : ""
          }
          onChange={(e) => setSelectedSlugs(e.target.value.split(","))}
          className="hidden"
        />
        <input
          name="project"
          value={selectedSlugs[0] || ""}
          onChange={(e) => setSelectedSlugs(e.target.value.split(","))}
          className="hidden"
        />
      </div>
    </Popover>
  );
}
