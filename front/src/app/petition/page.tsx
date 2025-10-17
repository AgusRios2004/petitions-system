'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Esta página no muestra contenido. Su única función es redirigir
 * a los usuarios desde /petition a /profile, donde ahora se 
 * encuentra la lista de peticiones.
 */
export default function PetitionRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/profile');
  }, [router]);

  // Muestra una pantalla de carga genérica mientras se completa la redirección.
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <p>Redirigiendo...</p>
    </div>
  );
}
