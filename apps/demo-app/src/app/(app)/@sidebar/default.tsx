"use client";

import { trpc } from "@/lib/trpc";
import { CreateTeam } from "./create-team";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@superplexo/ui/tabs";
import { ScrollArea } from "@superplexo/ui/scroll-area";
import { Button } from "@superplexo/ui/button";
import React from "react";

const Sidebar = () => {
  let [value, setValue] = React.useState("teams");
  let listAllProjects = trpc.listAllProjects.useQuery();
  let projects = listAllProjects.data || []


  return (
    <div className="flex flex-col h-full">
      <div className="flex-none h-[300px] bg-red-200">Sidebar</div>
      <Tabs value={value} onValueChange={setValue} className="">
        <div className="w-full flex space-x-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
          </TabsList>
          {value === "teams" && <CreateTeam />}
        </div>
        <TabsContent value="teams" className="grow">
          <div className="h-full w-full" >Teams</div>
        </TabsContent>
        <TabsContent value="projects" className="">
          <ScrollArea className="h-[500px]">
            <div className="pr-4">
              {projects.map((project) => (
                <div key={project.id}>
                  <Button variant="ghost" className="w-full h-min py-2 justify-start">{project.name}</Button>
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
