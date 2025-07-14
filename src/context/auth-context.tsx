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
      if (user) {
        try {
          const tokenResult = await user.getIdTokenResult();
          setUser(user);
          setClaims(tokenResult.claims);
          
          // Redirect logic after login or on page refresh - only on initial check or login page
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
            
            // Only redirect if we're on the login page and have a role
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
        // Only redirect to login if not already there and not initial load
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
      // Don't set loading to false here - onAuthStateChanged will handle it
    } catch (e: any) {
      setError(e.message || "Failed to sign in.");
      setLoading(false); // Only set loading to false on error
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
