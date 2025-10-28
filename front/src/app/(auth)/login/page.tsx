'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Importar useRouter
import { useAuth } from '@/context/AuthContext'; // Importar el hook useAuth
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null); // Estado para manejar errores
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado para deshabilitar el botón

  const { login } = useAuth(); // Obtener la función login del contexto
  const router = useRouter(); // Inicializar el router

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Llamar a la función login del contexto
      const result = await login(email, password);

      if (result.success) {
        // Si el login es exitoso, redirigir al perfil
        router.push('/profile');
      } else {
        // Si falla, mostrar el mensaje de error
        setError(result.message || 'Error al iniciar sesión');
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
            Iniciar sesión
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Accede a tu cuenta
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Contraseña
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="pt-1">
            <Button type="submit" variant="primary" size="md" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </div>
        </form>

        {/* Mensaje de error */}
        {error && (
          <div className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300">
            <p>{error}</p>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          ¿No tienes una cuenta?{' '}
          <Link
            href="/register"
            className="font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            Regístrate
          </Link>
        </p>

      </div>
    </div>
  );
}