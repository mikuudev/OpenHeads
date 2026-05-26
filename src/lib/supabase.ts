import { createBrowserClient } from "@supabase/ssr";

function makeClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createBrowserClient(url, key);
}

export const supabase = new Proxy({} as ReturnType<typeof createBrowserClient>, {
  get(_, prop) {
    const client = makeClient();
    const val = client[prop as keyof typeof client];
    return typeof val === "function" ? val.bind(client) : val;
  },
});
