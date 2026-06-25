"use client";

import React, { createContext, useState } from "react";
import axios from "axios";

export interface AuthContextType {
  user: any | null; // You can change 'any' to a specific User type later if you'd like!
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);

  const router = {
    push: (path: string) => {
      if (typeof window !== "undefined") {
        window.location.href = path;
      }
    },
  };

  const login = async (username: string, password: string) => {
    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      const response = await axios.post(
        "http://localhost:8000/auth/token",
        formData,
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        },
      );

      
      axios.defaults.headers.common["Authorization"] =
        `Bearer ${response.data.access_token}`;
      localStorage.setItem("token", response.data.access_token);
      setUser(response.data);

      router.push("/");
    } catch (err) {
      console.log("Login Failed:", err);
    }
  };

  const logout = () => {
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
    localStorage.removeItem("token"); // Good practice: remove the token from storage when logging out!
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
