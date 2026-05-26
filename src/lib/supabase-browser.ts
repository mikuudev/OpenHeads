import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

let _client: ReturnType<typeof createClient> | null = null;

export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_, prop) {
    if (!_client) _client = createClient();
    const value = _client[prop as keyof typeof _client];
    return typeof value === "function" ? value.bind(_client) : value;
  },
});
