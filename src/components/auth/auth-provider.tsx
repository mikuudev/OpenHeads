"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
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

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const { data } = await supabase.auth.getSession();

      if (data.session?.user) {
        const profile = await fetchProfile(data.session.user.id);
        setUser(profile);
      } else {
        const guestData = localStorage.getItem("openheads_guest");
        if (guestData) {
          try {
            setUser(JSON.parse(guestData));
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
      setInitialized(true);
      setLoading(false);
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setUser(profile);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, setLoading]);

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("openheads_guest");
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
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
