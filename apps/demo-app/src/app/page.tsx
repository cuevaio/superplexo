"use client";

import { trpc } from "@/lib/trpc";
import { Button } from "@superplexo/ui/button";

export default function Page() {
  let { data } = trpc.getUser.useQuery();

  return (
    <div>
      <pre>
        <code>{JSON.stringify(data, null, 2)}</code>
      </pre>
      <p>hello</p>


      <Button>hello</Button>
    </div>
  );
}
