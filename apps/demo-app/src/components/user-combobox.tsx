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
import { SelectedPick } from "@xata.io/client";
import { UsersRecord } from "@/lib/xata";

type MultipleProps = {
  multiple: true;
  initialUsers?: Readonly<SelectedPick<UsersRecord, ["*"]>>[];
  initialUsersCount?: number;
  handleOnClose?: (usersEmails: string[]) => void;
};

type SingleProps = {
  multiple?: false;
  initialUser?: Readonly<SelectedPick<UsersRecord, ["*"]>>;
  handleOnClose?: (userEmail: string | undefined) => void;
};

type Props = {
  placeholder: string;
} & (MultipleProps | SingleProps);

export function UserCombobox(props: Props) {
  const [open, setOpen] = React.useState(false);
  let [selectedEmails, setSelectedEmails] = React.useState<string[]>([]);

  let initialSelectedEmails: string[] = [];

  if (props.multiple) {
    if (props.initialUsers) {
      props.initialUsers.forEach((u) => {
        if (u.email) {
          initialSelectedEmails.push(u.email);
        }
      });
    }
  } else {
    if (props.initialUser) {
      if (props.initialUser.email) {
        initialSelectedEmails.push(props.initialUser.email);
      }
    }
  }

  // this will help to know if the combobox has been open at least once
  let hasBeenOpen = React.useRef(false);

  React.useEffect(() => {
    if (hasBeenOpen.current === true) return;
    if (open) {
      hasBeenOpen.current = true;
    }
  }, [open]);

  React.useEffect(() => {
    if (props.multiple) {
      if (props.initialUsers) {
        let emails: string[] = [];
        props.initialUsers.forEach((u) => {
          if (u.email) {
            emails.push(u.email);
          }
        });
        setSelectedEmails(emails);
      }
    } else {
      if (props.initialUser) {
        if (props.initialUser.email) {
          setSelectedEmails([props.initialUser.email]);
        }
      }
    }
  }, [props]);

  React.useEffect(() => {
    if (!props.handleOnClose) return;
    if (props.multiple) {
      if (initialSelectedEmails.length === selectedEmails.length) return;
    }
    if (!hasBeenOpen.current === true) return;
    if (!open) {
      if (props.multiple) {
        props.handleOnClose(selectedEmails);
      } else {
        selectedEmails[0]
          ? props.handleOnClose(selectedEmails[0])
          : props.handleOnClose(undefined);
      }
    }
  }, [open]);

  let getAllUsers = trpc.listAllUsers.useQuery();
  let users =
    getAllUsers.data?.sort((a, b) => {
      if (!a.name) return 1;
      if (!b.name) return -1;
      return a.name.localeCompare(b.name);
    }) || [];

  let selectedUsers =
    users
      .filter((u) => u.email && selectedEmails.includes(u.email))
      .sort((a, b) => {
        if (!a.name) return 1;
        if (!b.name) return -1;
        return a.name.localeCompare(b.name);
      }) || [];

  let placeholder = props.placeholder;
  if (props.multiple) {
    if (props.initialUsersCount) {
      placeholder = props.initialUsersCount + " users";
    }
  }

  if (selectedUsers.length === 1) {
    placeholder = selectedUsers[0]?.name || placeholder;
  } else {
    if (selectedUsers.length > 0) {
      if (props.multiple) {
        placeholder = `${selectedUsers.length} users`;
      }
    }
  }

  if (!props.multiple) {
    if (props.initialUser) {
      if (props.initialUser.name) {
        placeholder = props.initialUser.name;
      }
    }
  }

  let Icon = props.multiple ? UsersRoundIcon : UserRoundIcon;

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
