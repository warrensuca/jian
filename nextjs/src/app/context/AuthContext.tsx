"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser, registerUser, getMe } from "../../api/authAPI";
import { User } from "../../types";

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Rehydrate on mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("token");
      console.log("[AUTH CONTEXT] Initializing. Found saved token in localStorage?", !!savedToken);
      if (savedToken) {
        getMe(savedToken)
          .then((userData) => {
            console.log("[AUTH CONTEXT] Rehydration successful! User profile loaded:", userData);
            setUser(userData);
            setToken(savedToken);
          })
          .catch((err) => {
            console.warn("[AUTH CONTEXT] Token verification failed on mount, clearing stored token:", err);
            localStorage.removeItem("token");
            setUser(null);
            setToken(null);
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }
    } catch (e) {
      console.error("[AUTH CONTEXT] Failed to access localStorage:", e);
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (usernameOrEmail: string, password: string) => {
    console.log("[AUTH CONTEXT] Starting login flow for:", usernameOrEmail);
    const data = await loginUser(usernameOrEmail, password);
    console.log("[AUTH CONTEXT] Login API succeeded. Storing token and fetching profile...");
    
    localStorage.setItem("token", data.access_token);
    setToken(data.access_token);

    const userData = await getMe(data.access_token);
    console.log("[AUTH CONTEXT] User profile retrieved:", userData);
    setUser(userData);
    
    console.log("[AUTH CONTEXT] Redirecting to /dashboard...");
    router.push("/dashboard");
  }, [router]);

  const register = useCallback(async (username: string, email: string, password: string) => {
    console.log("[AUTH CONTEXT] Starting registration flow for:", username, email);
    await registerUser(username, email, password);
    console.log("[AUTH CONTEXT] Registration API succeeded. Automatically logging in new user...");
    await login(username, password);
  }, [login]);

  const logout = useCallback(() => {
    console.log("[AUTH CONTEXT] Logging out. Clearing state and token...");
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem("token");
    } catch (e) {
      console.error("[AUTH CONTEXT] Failed to clear token from localStorage:", e);
    }
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
