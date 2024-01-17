"use client";

import { trpc } from "@/lib/trpc";
import { Button } from "@superplexo/ui/button";
import Link from "next/link";

export default function Page() {
  let { data } = trpc.getUser.useQuery();

  return (
    <div>
      <p>hello, {data?.name?.split(" ")[0]}</p>
      <Button>
        <Link href="/tasks">{data?.name ? "Go to the app" : "Sign in"}</Link>
      </Button>
    </div>
  );
}
