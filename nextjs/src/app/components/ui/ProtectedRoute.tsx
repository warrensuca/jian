'use client'

import React, { useContext, useEffect, useState } from "react";
import { useRouter } from 'next/navigation'
import{ AuthContext, AuthContextType} from '@/app/context/AuthContext'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const ctx : AuthContextType | null = useContext(AuthContext);
    const router = useRouter();

    useEffect(() => {
        if (!ctx?.user) {
            router.push('/login')
        }
    }, [ctx?.user, router]);

    return ctx ? children : null
}