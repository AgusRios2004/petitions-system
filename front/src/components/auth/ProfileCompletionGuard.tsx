"use client";
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfileCompletionGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait for authentication to be resolved
    if (loading) {
      return;
    }

    // If the user is logged in, but the profile is not complete
    if (user && user.profileStatus && !user.profileStatus.hasCompletedProfile) {
      // And they are not already on the profile page (to avoid a redirect loop)
      if (pathname !== '/profile') {
        router.push('/profile');
      }
    }
  }, [user, loading, router, pathname]);

  // While loading, or if the user needs to be redirected, we can show a loader or nothing
  if (loading || (user && user.profileStatus && !user.profileStatus.hasCompletedProfile && pathname !== '/profile')) {
    // You can return a full-page loader here if you want
    return <div>Loading...</div>; 
  }

  // Otherwise, show the actual page content
  return <>{children}</>;
}
