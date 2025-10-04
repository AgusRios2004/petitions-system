"use client";
import React from 'react';
import { Box } from '@mui/material';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }}
    >
      {children}
    </Box>
  );
}