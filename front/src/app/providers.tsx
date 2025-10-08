"use client";

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../theme/theme';
import { AuthProvider } from '../context/AuthContext';
import ProfileCompletionGuard from '../components/auth/ProfileCompletionGuard';
import React from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <ProfileCompletionGuard>
          <CssBaseline />
          {children}
        </ProfileCompletionGuard>
      </AuthProvider>
    </ThemeProvider>
  );
}