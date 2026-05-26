"use client";

import { useEffect, useState, createContext, useContext } from "react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isGuest: false,
  signOut: async () => {},
  refreshUser: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, setUser, isLoading, setLoading } = useAuthStore();
  const [initialized, setInitialized] = useState(false);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();
    return data as User | null;
  };

  const syncGuestCookie = () => {
    const guestData = localStorage.getItem("openheads_guest");
    if (guestData) {
      document.cookie = `openheads_guest=true; path=/; max-age=86400; SameSite=Lax`;
    } else {
      document.cookie = `openheads_guest=; path=/; max-age=0; SameSite=Lax`;
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const { data } = await supabase.auth.getSession();

      if (data.session?.user) {
        const profile = await fetchProfile(data.session.user.id);
        setUser(profile);
        syncGuestCookie();
      } else {
        const guestData = localStorage.getItem("openheads_guest");
        if (guestData) {
          try {
            setUser(JSON.parse(guestData));
            document.cookie = `openheads_guest=true; path=/; max-age=86400; SameSite=Lax`;
          } catch {
            setUser(null);
            document.cookie = `openheads_guest=; path=/; max-age=0; SameSite=Lax`;
          }
        } else {
          setUser(null);
          document.cookie = `openheads_guest=; path=/; max-age=0; SameSite=Lax`;
        }
      }
      setInitialized(true);
      setLoading(false);
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          setUser(profile);
          syncGuestCookie();
        } else {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [setUser, setLoading]);

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("openheads_guest");
    document.cookie = `openheads_guest=; path=/; max-age=0; SameSite=Lax`;
    setUser(null);
  };

  const refreshUser = async () => {
    if (user && !user.is_guest) {
      const profile = await fetchProfile(user.id);
      if (profile) setUser(profile);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: isLoading || !initialized,
        isAuthenticated: !!user && !user.is_guest,
        isGuest: !!user?.is_guest,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
