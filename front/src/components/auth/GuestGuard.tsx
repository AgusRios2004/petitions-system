"use client";
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function GuestGuard({ children }: { children: React.ReactNode }) {
  // Development mode: Allow access to guest pages even if logged in.
  return <>{children}</>;

  /*
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // If the user is logged in, redirect them away from guest pages
      if (user) {
        router.push('/profile');
      }
    }
  }, [user, loading, router]);

  // If loading or if the user is logged in (and about to be redirected), show a loader
  if (loading || user) {
    return <div>Loading...</div>; // Or a spinner
  }

  // If the user is not logged in, show the guest page (login/register)
  return <>{children}</>;
  */
}