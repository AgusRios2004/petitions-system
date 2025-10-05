'use client';

import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const ProfilePage = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/login';
    }
  }, [user, loading]);

  if (loading) {
    return <div>Cargando perfil...</div>;
  }

  if (!user) {
    return null; // or a redirect component
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Perfil de Usuario</h1>
      <pre style={{ background: '#f4f4f4', padding: '1rem', borderRadius: '5px' }}>
        {JSON.stringify(user, null, 2)}
      </pre>
    </div>
  );
};

export default ProfilePage;
