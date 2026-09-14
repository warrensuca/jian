'use client';

import React, { useContext, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { AuthContext, AuthContextType } from '../../app/context/AuthContext';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const ctx: AuthContextType | null = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!ctx?.isLoading && !ctx?.user) {
      console.log("[PROTECTED ROUTE] User is not authenticated and loading is complete. Redirecting to /login");
      router.push('/login');
    }
  }, [ctx?.isLoading, ctx?.user, router]);

  if (ctx?.isLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <p className="text-sm text-muted-foreground">Checking authentication...</p>
      </div>
    );
  }

  return ctx?.user ? <>{children}</> : null;
};

export default ProtectedRoute;