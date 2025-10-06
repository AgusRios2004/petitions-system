"use client";
import React from 'react';
import { Box } from '@mui/material';

import GuestGuard from "@/components/auth/GuestGuard";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <GuestGuard>{children}</GuestGuard>;
}