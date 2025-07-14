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
  const [initialAuthChecked, setInitialAuthChecked] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        try {
          const tokenResult = await user.getIdTokenResult();
          setUser(user);
          setClaims(tokenResult.claims);
          
          if (!initialAuthChecked || pathname === '/') {
            const newRole = tokenResult.claims.superadmin 
              ? 'superadmin' 
              : tokenResult.claims.admin 
              ? 'admin' 
              : tokenResult.claims.teacher 
              ? 'teacher' 
              : tokenResult.claims.student 
              ? 'student' 
              : null;
            
            if (pathname === '/' && newRole) {
              router.push(`/${newRole}/dashboard`);
            }
          }
        } catch (error) {
          console.error('Error getting user token:', error);
          setUser(null);
          setClaims(null);
        }
      } else {
        setUser(null);
        setClaims(null);
        if (initialAuthChecked && pathname !== '/') {
          router.push('/');
        }
      }
      
      setLoading(false);
      if (!initialAuthChecked) {
        setInitialAuthChecked(true);
      }
    });

    return () => unsubscribe();
  }, [router, pathname, initialAuthChecked]);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (e: any) {
      setError(e.message || "Failed to sign in.");
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e: any) {
      console.error("Logout failed:", e);
      // Even if logout fails, we might want to ensure loading is false.
      setLoading(false);
    }
  };

  const value = { user, claims, loading, error, login, logout };

  return (
    <AuthContext.Provider value={value}>
        {initialAuthChecked ? children : <LoadingSpinner fullScreen />}
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
