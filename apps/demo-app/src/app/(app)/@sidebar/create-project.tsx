
"use client";

import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@superplexo/ui/dialog";

import { Input } from "@superplexo/ui/input";
import { Button } from "@superplexo/ui/button";
import { trpc } from "@/lib/trpc";
import { UserCombobox } from "@/components/user-combobox";
import { PlusIcon } from "lucide-react";
import { TeamCombobox } from "@/components/team-combobox";
import { Textarea } from "@superplexo/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";

export const CreateProject = () => {
  let [dialogOpen, setDialogOpen] = React.useState(false);
  let queryClient = useQueryClient();
  let listAllProjectsKey = getQueryKey(trpc.listAllProjects);

  let createProject = trpc.createProject.useMutation({
    onSuccess: () => {
      setDialogOpen(false);
      queryClient.invalidateQueries(listAllProjectsKey);
    },
  });

  let handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    let form = event.target as HTMLFormElement;
    let formData = new FormData(form);
    let projectName = formData.get("projectName");
    if (!projectName) {
      // TODO: Toast error
      return;
    }

    let projectDescription = formData.get("projectDescription");
    let leadEmail = formData.get("Lead");
    let memberEmails = formData.get("Members");
    let teamSlugs = formData.get("Teams");

    createProject.mutate({
      projectName: projectName.toString(),
      memberEmails: memberEmails
        ? memberEmails.toString().split(",")
        : undefined,
      teamSlugs: teamSlugs
        ? teamSlugs.toString().split(",")
        : undefined,
      leadEmail: leadEmail ? leadEmail.toString() : undefined,
      projectDescription: projectDescription
        ? projectDescription.toString()
        : undefined,
    });
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost"><PlusIcon className="h-4 w-4" /></Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
          <DialogDescription>
            Create a new project to collaborate with your friends.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input name="projectName" placeholder="Project name" required />
          <Textarea name="projectDescription" placeholder="Project description" />
          <div className="flex flex-row space-x-4">
            <UserCombobox placeholder="Lead" multiple={false} />
            <UserCombobox placeholder="Members" multiple={true} />
            <TeamCombobox placeholder="Teams" multiple={true} />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
