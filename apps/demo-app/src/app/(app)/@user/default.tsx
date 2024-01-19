export const runtime = "edge";
export const preferredRegion = ["iad1"];

import { auth } from "@/auth";
import { UsersRecord, getXataClient } from "@/lib/xata";
import { User } from "./user";
import { SelectedPick } from "@xata.io/client";
let xata = getXataClient();

const UserPage = async () => {
  let session = await auth();
  if (!session) throw new Error("Not authenticated");
  if (!session.user) throw new Error("No user");

  let user = await xata.db.users
    .filter({ email: session.user.email })
    .getFirst();

  if (!user) throw new Error("User not found");

  let readonlyUser = JSON.parse(JSON.stringify(user)) as Readonly<
    SelectedPick<UsersRecord, ["*"]>
  >;

  return <User initialUser={readonlyUser} />;
};

export default UserPage;
