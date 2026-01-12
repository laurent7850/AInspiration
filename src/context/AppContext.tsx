import React, { createContext, useContext, ReactNode, useState } from 'react';
import { LanguageProvider } from './LanguageContext';
import { AuthProvider } from './AuthContext';
import { NotificationProvider } from './NotificationContext';
import { HelmetProvider } from 'react-helmet-async';

const AppContextProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  return (
    <HelmetProvider>
      <LanguageProvider>
        <AuthProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </AuthProvider>
      </LanguageProvider>
    </HelmetProvider>
  );
};

export default AppContextProvider;