'use client';

import { useState } from 'react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<null | { ok: boolean; data?: unknown; message?: string }>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const res = await fetch(`${base}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({ ok: false, message: data?.message || 'Error en login' });
        return;
      }
      setResult({ ok: true, data });
    } catch (err: any) {
      setResult({ ok: false, message: err?.message || 'Error de red' });
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
              className="mt-1"
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
              className="mt-1"
            />
          </div>

          <div className="pt-1">
            <Button type="submit" variant="primary" size="md" className="w-full">
              Ingresar
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          ¿No tienes una cuenta?{' '}
          <Link
            href="/register"
            className="font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            Regístrate
          </Link>
        </p>

        {result && (
          <div className={`mt-6 rounded-lg border p-4 text-sm ${result.ok ? 'border-green-300 bg-green-50 text-green-800 dark:border-green-900/50 dark:bg-green-950/50 dark:text-green-300' : 'border-red-300 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300'}`}>
            {result.ok ? (
              <>
                <p className="font-medium">Ingreso correctamente</p>
                <pre className="mt-2 overflow-auto whitespace-pre-wrap break-words text-xs">{JSON.stringify(result.data, null, 2)}</pre>
              </>
            ) : (
              <p>{result.message}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
