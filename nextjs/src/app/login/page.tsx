"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { roboto_mono, space_grotesk } from "../../lib/fonts";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";

export default function LoginPage() {
  const { login, register, user, isLoading } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, show an easy return link
  if (!isLoading && user) {
    return (
      <main className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col items-center justify-center px-5 py-14">
        <p className={`${roboto_mono.className} mb-3 text-xs text-[#4A7865]`}>
          ALREADY SIGNED IN
        </p>
        <h1
          className={`${space_grotesk.className} mb-6 text-3xl font-bold text-foreground`}
        >
          Welcome back, {user.username}.
        </h1>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-full bg-[#315c4b] px-6 py-2.5 text-sm text-white transition-transform hover:-translate-y-0.5"
        >
          Go to dashboard <ArrowRight size={16} weight="bold" />
        </Link>
      </main>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    console.log(`[LOGIN PAGE] Submitting form in '${mode}' mode with username:`, username);

    try {
      if (mode === "register") {
        await register(username.trim(), email.trim(), password);
      } else {
        await login(username.trim(), password);
      }
      console.log(`[LOGIN PAGE] ${mode} action completed successfully.`);
    } catch (err) {
      console.error(`[LOGIN PAGE] Error during ${mode}:`, err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : mode === "register"
            ? "Registration failed. Please check your details."
            : "Sign in failed. Please check your credentials.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col items-center justify-center px-5 py-14">
      <div className="w-full rounded-xl border border-[#c9c1b5] bg-white/80 p-8 shadow-[0_18px_60px_rgba(58,48,36,0.05)]">
        <p
          className={`${roboto_mono.className} mb-2 text-xs tracking-[0.12em] text-[#4A7865]`}
        >
          {mode === "login" ? "WELCOME BACK" : "JOIN JIAN"}
        </p>
        <h1
          className={`${space_grotesk.className} mb-8 text-3xl font-bold text-foreground`}
        >
          {mode === "login" ? "Sign in." : "Create account."}
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="username"
              className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground"
            >
              {mode === "login" ? "Username or Email" : "Username"}
            </label>
            <input
              id="username"
              type="text"
              required
              autoComplete={mode === "login" ? "username" : "new-username"}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-[#c9c1b5] bg-[#F4F1EB] px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-[#4A7865] focus:ring-1 focus:ring-[#4A7865]/30"
              placeholder={mode === "login" ? "username or email" : "your username"}
            />
          </div>

          {mode === "register" && (
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-[#c9c1b5] bg-[#F4F1EB] px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-[#4A7865] focus:ring-1 focus:ring-[#4A7865]/30"
                placeholder="you@example.com"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-[#c9c1b5] bg-[#F4F1EB] px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-[#4A7865] focus:ring-1 focus:ring-[#4A7865]/30"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-xs leading-relaxed text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[#315c4b] px-6 py-2.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-[#284e3f] disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {isSubmitting
              ? "Please wait…"
              : mode === "login"
                ? "Sign in"
                : "Create account"}
            {!isSubmitting && <ArrowRight size={16} weight="bold" />}
          </button>
        </form>

        <div className="mt-6 border-t border-[#e2ddd4] pt-5 text-center">
          <p className="text-sm text-muted-foreground">
            {mode === "login"
              ? "Don't have an account?"
              : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError(null);
              }}
              className="font-medium text-[#4A7865] underline-offset-2 transition-colors hover:text-[#315c4b] hover:underline"
            >
              {mode === "login" ? "Create one" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}