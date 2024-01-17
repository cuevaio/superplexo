"use client";

import * as React from "react";
import { Check, UserRoundIcon, UsersRoundIcon } from "lucide-react";

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

export function UserCombobox(props: Props) {
  const [open, setOpen] = React.useState(false);
  let [selectedEmails, setSelectedEmails] = React.useState<string[]>([]);

  let getAllUsers = trpc.listAllUsers.useQuery();
  let users =
    getAllUsers.data?.sort((a, b) => {
      if (!a.name) return 1;
      if (!b.name) return -1;
      return a.name.localeCompare(b.name);
    }) || [];

  let selectedUsers = users
    .filter((u) => u.email && selectedEmails.includes(u.email))
    .sort((a, b) => {
      if (!a.name) return 1;
      if (!b.name) return -1;
      return a.name.localeCompare(b.name);
    });

  let placeholder = props.placeholder;
  if (selectedUsers.length === 1) {
    placeholder = selectedUsers[0]?.name || placeholder;
  } else {
    if (selectedUsers.length > 0) {
      if (props.multiple) {
        placeholder = `${selectedUsers.length} users`;
      }
    }
  }

  let Icon = props.multiple ? UsersRoundIcon : UserRoundIcon;

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
          <CommandInput className="" placeholder="Search user..." />
          <CommandList className="">
            <ScrollArea className="h-64">
              <CommandEmpty>No user found.</CommandEmpty>
              <CommandGroup>
                {selectedUsers.map(
                  (user) =>
                    user.email &&
                    user.name && (
                      <CommandItem
                        key={user.email}
                        value={user.name}
                        onChange={() => {}}
                        onSelect={() => {
                          setSelectedEmails(
                            selectedEmails.filter((e) => e !== user.email)
                          );
                        }}
                      >
                        <Check className={cn("mr-2 h-4 w-4")} />
                        {user.name}
                      </CommandItem>
                    )
                )}
                {users.map(
                  (user) =>
                    user.name &&
                    user.email &&
                    !selectedEmails.includes(user.email) && (
                      <CommandItem
                        key={user.email}
                        value={user.name}
                        onChange={() => {}}
                        onSelect={() => {
                          if (!user.email) return;
                          if (selectedEmails.includes(user.email)) {
                            setSelectedEmails(
                              selectedEmails.filter((e) => e !== user.email)
                            );
                          } else {
                            if (props.multiple) {
                              setSelectedEmails([
                                ...selectedEmails,
                                user.email,
                              ]);
                            } else {
                              setSelectedEmails([user.email]);
                            }
                          }
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedEmails.includes(user.email)
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {user.name}
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
            selectedEmails.length && selectedEmails.length > 0
              ? selectedEmails.join(",")
              : ""
          }
          onChange={(e) => setSelectedEmails(e.target.value.split(","))}
          className="hidden"
        />
      </div>
    </Popover>
  );
}
