"use client";

import { dummy } from "@/api/recipeAPI";
import { useEffect, useState } from "react";

const WAKEUP_MESSAGES = [
  "Checking the kitchen...",
  "Waking the recipe API...",
  "Render is starting the service...",
  "Almost ready to cook...",
];

type ApiWakeupGateProps = {
  children: React.ReactNode;
};

let wakeupRequest: Promise<void> | null = null;

function requestApiWakeup() {
  if (!wakeupRequest) {
    wakeupRequest = dummy().catch((error) => {
      wakeupRequest = null;
      throw error;
    });
  }

  return wakeupRequest;
}

export default function ApiWakeupGate({ children }: ApiWakeupGateProps) {
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    requestApiWakeup()
      .then(() => {
        if (isCurrent) setIsReady(true);
      })
      .catch((error) => {
        console.error("Unable to wake the recipe API:", error);
        if (isCurrent) setHasError(true);
      });

    return () => {
      isCurrent = false;
    };
  }, [attempt]);

  useEffect(() => {
    if (isReady || hasError) return;

    const timer = window.setInterval(() => {
      setElapsedSeconds((seconds) => seconds + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [hasError, isReady]);

  if (isReady) return children;

  const messageIndex = Math.min(
    Math.floor(elapsedSeconds / 6),
    WAKEUP_MESSAGES.length - 1,
  );

  return (
    <main className="flex min-h-[calc(100vh-3.5625rem)] w-full items-center justify-center bg-background px-6">
      <div className="flex w-full max-w-md flex-col items-center border border-[#B8B8B8] bg-white px-8 py-12 text-center shadow-sm">
        <p className="text-xs tracking-[0.2em] text-[#4A7865]">JIAN API</p>

        {hasError ? (
          <>
            <h1 className="mt-5 text-2xl font-bold text-foreground">
              The kitchen did not answer.
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              The recipe service may still be starting. Try waking it again.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setHasError(false);
                  setElapsedSeconds(0);
                  setAttempt((currentAttempt) => currentAttempt + 1);
                }}
                className="border border-[#4A7865] bg-[#4A7865] px-5 py-2 text-sm text-white transition-colors hover:bg-[#3D6555]"
              >
                Try again
              </button>
              <button
                type="button"
                onClick={() => setIsReady(true)}
                className="border border-[#B8B8B8] px-5 py-2 text-sm text-foreground transition-colors hover:bg-[#F8F6F3]"
              >
                Continue anyway
              </button>
            </div>
          </>
        ) : (
          <>
            <div
              className="mt-7 flex h-9 items-end gap-1.5"
              role="status"
              aria-label="Waking the recipe API"
            >
              {[0, 1, 2, 3, 4].map((bar) => (
                <span
                  key={bar}
                  className="api-loading-bar block w-1.5 bg-[#D4943E]"
                  style={{ animationDelay: `${bar * 120}ms` }}
                />
              ))}
            </div>
            <h1
              className="mt-6 text-2xl font-bold text-foreground"
              aria-live="polite"
            >
              {WAKEUP_MESSAGES[messageIndex]}
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Free Render services sleep when idle. A cold start can take up to
              a minute.
            </p>
            <p className="mt-5 text-xs tabular-nums text-[#4A7865]">
              {elapsedSeconds}s elapsed
            </p>
          </>
        )}
      </div>
    </main>
  );
}
