"use client";
import React from 'react';
import { Box } from '@mui/material';

import ProfileCompletionGuard from "@/components/auth/ProfileCompletionGuard";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProfileCompletionGuard>
      {children}
    </ProfileCompletionGuard>
  );
}