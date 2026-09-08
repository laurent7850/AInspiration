import { createContext, useContext } from 'react';
import type { AuthContextType } from '../context/AuthContext';

// The context object lives here rather than next to <AuthProvider> so that
// AuthContext.tsx only exports a component and React Fast Refresh keeps working.
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
