"use client";

import { trpc } from "@/lib/trpc";
import { TeamsRecord } from "@/lib/xata";
import { Button } from "@superplexo/ui/button";
import { ScrollArea } from "@superplexo/ui/scroll-area";
import { SelectedPick } from "@xata.io/client";
import { HeartHandshakeIcon } from "lucide-react";

type Props = {
  initialData: Readonly<SelectedPick<TeamsRecord, ["*"]>>[]
}

export const TeamsList = ({ initialData }: Props) => {
  let listAllTeams = trpc.listAllTeams.useQuery()
  let teams = listAllTeams.data || initialData || [];

  return (
    <ScrollArea className="h-[500px]">
      <div className="pr-4">
        {teams.map((team) => (
          <div key={team.id}>
            <Button
              variant="ghost"
              className="w-full h-min py-2 justify-start"
            >
              <HeartHandshakeIcon className="w-4 h-4 mr-2 text-primary" />
              {team.name}
            </Button>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
