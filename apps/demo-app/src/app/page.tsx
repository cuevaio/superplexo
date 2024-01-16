import { auth } from "@/auth";

export default async function Page() {
  let data = await auth();

  return <div>
    <pre><code>{JSON.stringify(data, null, 2)}</code></pre>
    <p>hello</p>
  </div>;

}
