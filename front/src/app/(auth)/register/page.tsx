'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'customer' | 'provider'>('customer'); // Estado para el rol
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await register(name, lastname, email, password, role);

      if (result.success) {
        // Redirigir al login tras registro exitoso
        router.push('/login');
      } else {
        setError(result.message || 'Error al registrarse');
      }
    } catch (err: any) {
      setError(err?.message || 'Error de red. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">
      <div className="w-full max-w-md mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-800">
        
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Crear una cuenta
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Únete a nuestra comunidad.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          {/* Selección de Rol */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                role === 'customer' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Soy Cliente
            </button>
            <button
              type="button"
              onClick={() => setRole('provider')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                role === 'provider' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Soy Proveedor
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
              <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1" />
            </div>
            <div>
              <label htmlFor="lastname" className="text-sm font-medium text-gray-700 dark:text-gray-300">Apellido</label>
              <Input id="lastname" type="text" value={lastname} onChange={(e) => setLastname(e.target.value)} required className="mt-1" />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <Input id="email" type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1" />
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">Contraseña</label>
            <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1" />
          </div>

          <div className="pt-1">
            <Button type="submit" variant="primary" size="md" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Registrando...' : 'Crear cuenta'}
            </Button>
          </div>
        </form>

        {error && (
          <div className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300">
            <p>{error}</p>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
            Inicia sesión
          </Link>
        </p>

      </div>
    </div>
  );
}
