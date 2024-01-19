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
import { Loader2, PlusIcon } from "lucide-react";
import { TeamCombobox } from "@/components/team-combobox";
import { Textarea } from "@superplexo/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const CreateProject = () => {
  let [dialogOpen, setDialogOpen] = React.useState(false);
  let queryClient = useQueryClient();
  let listAllProjectsKey = getQueryKey(trpc.listAllProjects);
  let router = useRouter();
  let createProject = trpc.createProject.useMutation({
    onSuccess: (projectSlug) => {
      setDialogOpen(false);
      queryClient.invalidateQueries(listAllProjectsKey);
      toast.success("Project created");
      router.push("/projects/" + projectSlug);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  let handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    let form = event.target as HTMLFormElement;
    let formData = new FormData(form);
    let projectName = formData.get("projectName");
    if (!projectName) {
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
      teamSlugs: teamSlugs ? teamSlugs.toString().split(",") : undefined,
      leadEmail: leadEmail ? leadEmail.toString() : undefined,
      projectDescription: projectDescription
        ? projectDescription.toString()
        : undefined,
    });
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" className="absolute top-0 right-0">
          <PlusIcon className="h-4 w-4" />
        </Button>
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
          <Textarea
            name="projectDescription"
            placeholder="Project description"
          />
          <div className="flex flex-row space-x-4">
            <UserCombobox placeholder="Lead" />
            <UserCombobox placeholder="Members" multiple />
            <TeamCombobox placeholder="Teams" multiple />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
              }}
              disabled={createProject.isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createProject.isLoading}>
              {createProject.isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
