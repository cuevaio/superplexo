"use client";

import { useUser } from "@/hooks/use-user";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@superplexo/ui/popover";
import { Button } from "@superplexo/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@superplexo/ui/avatar";
import Link from "next/link";
import { SelectedPick } from "@xata.io/client";
import { UsersRecord } from "@/lib/xata";

interface Props {
  initialUser?: Readonly<SelectedPick<UsersRecord, ["*"]>>;
}

export const User = ({ initialUser }: Props) => {
  let getUser = useUser();

  let user = getUser?.user || initialUser;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="rounded-none w-full h-full space-x-4 justify-start"
        >
          <Avatar>
            <AvatarImage
              src={user?.actualImage?.url || undefined}
              alt="Profile picture"
            />
            <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
          </Avatar>

          <div className="flex flex-col items-start justify-center space-y-0.5">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs font-normal text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-32 p-1">
        <div className="flex flex-col items-center justify-center space-y-1">
          <Button variant="ghost" className="w-full" asChild>
            <Link href="/settings">Settings</Link>
          </Button>
          <Button variant="ghost" className="w-full" asChild>
            <Link href="/api/auth/signout">Logout</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
