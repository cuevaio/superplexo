"use client";

import * as React from "react";
import { Check, HeartHandshakeIcon, WaypointsIcon } from "lucide-react";

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
  multiple?: true;
}

export function TeamCombobox(props: Props) {
  const [open, setOpen] = React.useState(false);
  let [selectedSlugs, setSelectedSlugs] = React.useState<string[]>([]);

  let listAllTeams = trpc.listAllTeams.useQuery();
  let teams =
    listAllTeams.data?.sort((a, b) => {
      if (!a.name) return 1;
      if (!b.name) return -1;
      return a.name.localeCompare(b.name);
    }) || [];

  let selectedTeams = teams
    .filter((team) => team.slug && selectedSlugs.includes(team.slug))
    .sort((a, b) => {
      if (!a.name) return 1;
      if (!b.name) return -1;
      return a.name.localeCompare(b.name);
    });

  let placeholder = props.placeholder;
  if (selectedTeams.length === 1) {
    placeholder = selectedTeams[0]?.name || placeholder;
  } else {
    if (selectedTeams.length > 0) {
      if (props.multiple) {
        placeholder = `${selectedTeams.length} teams`;
      }
    }
  }

  let Icon = props.multiple ? WaypointsIcon : HeartHandshakeIcon;

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
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
          <CommandInput className="" placeholder="Search team..." />
          <CommandList className="">
            <ScrollArea className="h-64">
              <CommandEmpty>No team found.</CommandEmpty>
              <CommandGroup>
                {selectedTeams.map(
                  (team) =>
                    team.slug &&
                    team.name && (
                      <CommandItem
                        key={team.slug}
                        value={team.name}
                        onChange={() => {}}
                        onSelect={() => {
                          setSelectedSlugs(
                            selectedSlugs.filter((e) => e !== team.slug)
                          );
                        }}
                      >
                        <Check className={cn("mr-2 h-4 w-4")} />
                        {team.name}
                      </CommandItem>
                    )
                )}
                {teams.map(
                  (team) =>
                    team.name &&
                    team.slug &&
                    !selectedSlugs.includes(team.slug) && (
                      <CommandItem
                        key={team.slug}
                        value={team.name}
                        onChange={() => {}}
                        onSelect={() => {
                          if (!team.slug) return;
                          if (selectedSlugs.includes(team.slug)) {
                            setSelectedSlugs(
                              selectedSlugs.filter((e) => e !== team.slug)
                            );
                          } else {
                            if (props.multiple) {
                              setSelectedSlugs([...selectedSlugs, team.slug]);
                            } else {
                              setSelectedSlugs([team.slug]);
                            }
                          }
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedSlugs.includes(team.slug)
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {team.name}
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
          name={props.placeholder}
          value={
            selectedSlugs.length && selectedSlugs.length > 0
              ? selectedSlugs.join(",")
              : ""
          }
          onChange={(e) => setSelectedSlugs(e.target.value.split(","))}
          className="hidden"
        />
      </div>
    </Popover>
  );
}
