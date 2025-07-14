"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { LoadingSpinner } from '@/components/loading-spinner';

interface Claims {
  [key: string]: any;
  superadmin?: boolean;
  admin?: boolean;
  teacher?: boolean;
  student?: boolean;
  organizationId?: string;
}

interface AuthContextType {
  user: User | null;
  claims: Claims | null;
  loading: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [claims, setClaims] = useState<Claims | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const tokenResult = await user.getIdTokenResult();
        setUser(user);
        setClaims(tokenResult.claims);
        
        // Redirect logic after login or on page refresh
        const currentRole = claims?.superadmin ? 'superadmin' : claims?.admin ? 'admin' : claims?.teacher ? 'teacher' : claims?.student ? 'student' : null;
        const newRole = tokenResult.claims.superadmin ? 'superadmin' : tokenResult.claims.admin ? 'admin' : tokenResult.claims.teacher ? 'teacher' : tokenResult.claims.student ? 'student' : null;
        
        if (pathname === '/' || (currentRole && !pathname.startsWith(`/${currentRole}`))) {
            if (newRole) {
                router.push(`/${newRole}/dashboard`);
            }
        }

      } else {
        setUser(null);
        setClaims(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, pathname, claims]);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      // Redirection is handled by onAuthStateChanged
    } catch (e: any) {
      setError(e.message || "Failed to sign in.");
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      router.push('/');
    } catch (e: any) {
      console.error("Logout failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const value = { user, claims, loading, error, login, logout };

  return (
    <AuthContext.Provider value={value}>
        {loading ? <LoadingSpinner fullScreen /> : children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
