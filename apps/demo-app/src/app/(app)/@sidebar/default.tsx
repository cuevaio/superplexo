"use client";

import { trpc } from "@/lib/trpc";
import { CreateTeam } from "./create-team";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@superplexo/ui/tabs";
import { ScrollArea } from "@superplexo/ui/scroll-area";
import { Button } from "@superplexo/ui/button";
import React from "react";
import { CreateProject } from "./create-project";
import { DnaIcon, RocketIcon } from "lucide-react";

const Sidebar = () => {
  let [value, setValue] = React.useState("teams");

  let listAllProjects = trpc.listAllProjects.useQuery();
  let projects = listAllProjects.data || [];

  let listAllTeams = trpc.listAllTeams.useQuery();
  let teams = listAllTeams.data || [];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-none h-[300px]">Sidebar</div>
      <Tabs value={value} onValueChange={setValue} className="">
        <div className="w-full flex space-x-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
          </TabsList>
          {value === "teams" && <CreateTeam />}
          {value === "projects" && <CreateProject />}
        </div>
        <TabsContent value="teams" className="">
          <ScrollArea className="h-[500px]">
            <div className="pr-4">
              {teams.map((team) => (
                <div key={team.id}>
                  <Button
                    variant="ghost"
                    className="w-full h-min py-2 justify-start"
                  >
                    <DnaIcon className="w-4 h-4 mr-2 text-primary" />
                    {team.name}
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="projects" className="">
          <ScrollArea className="h-[500px]">
            <div className="pr-4">
              {projects.map((project) => (
                <div key={project.id}>
                  <Button
                    variant="ghost"
                    className="w-full h-min py-2 justify-start"
                  >
                    <RocketIcon className="w-4 h-4 mr-2 text-primary" />
                    {project.name}
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Sidebar;
