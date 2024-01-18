import { Tabs, TabsList, TabsTrigger, TabsContent } from "@superplexo/ui/tabs";
import { LayoutGridIcon, WaypointsIcon } from "lucide-react";
import { TeamsList } from "./teams-list";
import { ProjectsList } from "./projects-list";

import { getXataClient } from "@/lib/xata";
let xata = getXataClient();

const Sidebar = async () => {
  let [teams, projects] = await Promise.all([
    xata.db.teams.sort("name", "asc").getAll(),
    xata.db.projects.sort("name", "asc").getAll()
  ])

  return (
    <div className="flex flex-col h-full">
      <div className="flex-none h-[300px]">Sidebar</div>
      <Tabs className="">
        <div className="w-full flex space-x-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="teams">
              <WaypointsIcon className="w-4 h-4 mr-2" />
              Teams</TabsTrigger>
            <TabsTrigger value="projects">
              <LayoutGridIcon className="w-4 h-4 mr-2" />
              Projects</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="teams" className="">
          <TeamsList initialData={teams} />


        </TabsContent>
        <TabsContent value="projects" className="">
          <ProjectsList initialData={projects} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Sidebar;
