export const runtime = "edge";
export const preferredRegion = ["iad1"];

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@superplexo/ui/tabs";
import { LayoutGridIcon, WaypointsIcon } from "lucide-react";
import { TeamsList } from "./teams-list";
import { ProjectsList } from "./projects-list";

import { getXataClient } from "@/lib/xata";
let xata = getXataClient();

const Sidebar = async () => {
  let [teams, projects] = await Promise.all([
    xata.db.teams.sort("name", "asc").getAll(),
    xata.db.projects.sort("name", "asc").getAll(),
  ]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-none h-[300px]">Sidebar</div>
      <Tabs defaultValue="teams" className="relative">
        <TabsList className="grid w-[80%] grid-cols-2">
          <TabsTrigger value="teams" className="text-xs">
            <WaypointsIcon className="w-4 h-4 mr-1" />
            Teams
          </TabsTrigger>
          <TabsTrigger value="projects" className="text-xs">
            <LayoutGridIcon className="w-4 h-4 mr-1" />
            Projects
          </TabsTrigger>
        </TabsList>
        <TabsContent value="teams" className="">
          <TeamsList initialData={JSON.parse(JSON.stringify(teams))} />
        </TabsContent>
        <TabsContent value="projects" className="">
          <ProjectsList initialData={JSON.parse(JSON.stringify(projects))} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Sidebar;
