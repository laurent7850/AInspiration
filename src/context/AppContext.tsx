import { type ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { NotificationProvider } from './NotificationContext';
import { HelmetProvider } from 'react-helmet-async';

interface AppContextProviderProps {
  children: ReactNode;
}

function AppContextProvider({ children }: AppContextProviderProps) {
  return (
    <HelmetProvider>
      <AuthProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default AppContextProvider;