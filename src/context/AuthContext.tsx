import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, setToken, clearToken, getToken } from '../utils/api';
import { logLogin, logLogout } from '../services/accessLogService';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  company?: string;
  role?: string;
  created_at?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, company: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(() => !!getToken());

  useEffect(() => {
    // Only check token if one exists — don't block first paint
    const token = getToken();
    if (token) {
      // Use requestIdleCallback to defer auth check after LCP
      const check = () => {
        api.get<{ user: AuthUser }>('/auth/me')
          .then(({ user }) => setUser(user))
          .catch(() => { clearToken(); setUser(null); })
          .finally(() => setLoading(false));
      };
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(check, { timeout: 2000 });
      } else {
        setTimeout(check, 100);
      }
    }
  }, []);

  const signUp = async (email: string, password: string, name: string, company: string) => {
    const { token, user } = await api.post<{ token: string; user: AuthUser }>('/auth/register', {
      email,
      password,
      name,
      company,
    });
    setToken(token);
    setUser(user);
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { token, user } = await api.post<{ token: string; user: AuthUser }>('/auth/login', {
        email,
        password,
      });
      setToken(token);
      setUser(user);
      await logLogin(user.id, 'success');
    } catch (err) {
      await logLogin('', 'failed');
      throw err;
    }
  };

  const signOut = async () => {
    await logLogout();
    clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      signIn,
      signUp,
      signOut,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
