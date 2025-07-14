"use client";

import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { LoadingSpinner } from "@/components/loading-spinner"
import { SuperadminLayoutClient } from "./layout-client";

export default function SuperadminLayout({
  children,
}: {
  children: React.ReactNode
}) {
    const { user, claims, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && (!user || !claims?.superadmin)) {
            router.push('/');
        }
    }, [user, claims, loading, router]);

    if (loading || !user || !claims?.superadmin) {
        return <LoadingSpinner fullScreen />;
    }
  
  return (
    <SuperadminLayoutClient>
        {children}
    </SuperadminLayoutClient>
  )
}
