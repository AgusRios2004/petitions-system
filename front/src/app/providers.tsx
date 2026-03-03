"use client";

import ThemeRegistry from "@/theme/ThemeRegistry";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeRegistry>
      <AuthProvider>
        <Toaster position="top-right" reverseOrder={false} />
        {children}
      </AuthProvider>
    </ThemeRegistry>
  );
}