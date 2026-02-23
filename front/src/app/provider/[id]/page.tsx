'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import PublicProfileContent from '@/components/profile/provider/PublicProfileContent';

const ProviderPublicProfilePage = () => {
  const params = useParams();
  const providerId = params.id as string;

  if (!providerId) {
    return <div>Cargando...</div>;
  }

  return <PublicProfileContent providerId={parseInt(providerId, 10)} />;
};

export default ProviderPublicProfilePage;