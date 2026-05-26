"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState(false);

  useEffect(() => {
    const handleCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        setError(true);
        return;
      }
      if (data.session) {
        router.replace("/");
      } else {
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const accessToken = hashParams.get("access_token");
        if (accessToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: hashParams.get("refresh_token") || "",
          });
          if (!sessionError) {
            router.replace("/");
            return;
          }
        }
        setTimeout(() => router.replace("/auth/login"), 2000);
      }
    };
    handleCallback();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-dvh flex items-center justify-center flex-col gap-4">
        <p className="text-zinc-400">Authentication failed</p>
        <button
          onClick={() => router.replace("/auth/login")}
          className="text-violet-400 underline text-sm"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 animate-spin" />
        <p className="text-sm text-zinc-500">Completing sign in...</p>
      </div>
    </div>
  );
}
