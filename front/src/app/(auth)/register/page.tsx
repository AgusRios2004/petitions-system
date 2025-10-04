'use client';

import { useState } from 'react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import Link from 'next/link';

export default function RegisterPage() {
  const [role, setRole] = useState<'customer' | 'provider' | 'both'>('customer');

  const [name, setName] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [result, setResult] = useState<null | { ok: boolean; data?: unknown; message?: string }>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const body = { name, lastname, email, password, enabled: 1 };

      const res = await fetch(`${base}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({ ok: false, message: data?.message || 'Error en registro' });
        return;
      }

      try {
        localStorage.setItem('pending_profile_role', role);
        if (data?.data?.id_user) {
          localStorage.setItem('pending_user_id', String(data.data.id_user));
        }
      } catch {}

      setResult({ ok: true, data });
    } catch (err: any) {
      setResult({ ok: false, message: err?.message || 'Error de red' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto flex min-h-screen max-w-screen-sm items-center px-4">
        <div className="w-full">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Crear cuenta</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Únete y comienza ahora</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="grid grid-cols-3 gap-2">
                <label className={`cursor-pointer rounded-lg border px-3 py-2 text-sm text-center ${role === 'customer' ? 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300' : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300'}`}>
                  <input type="radio" name="role" value="customer" className="mr-2" checked={role === 'customer'} onChange={() => setRole('customer')} />
                  Cliente
                </label>
                <label className={`cursor-pointer rounded-lg border px-3 py-2 text-sm text-center ${role === 'provider' ? 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300' : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300'}`}>
                  <input type="radio" name="role" value="provider" className="mr-2" checked={role === 'provider'} onChange={() => setRole('provider')} />
                  Proveedor
                </label>
                <label className={`cursor-pointer rounded-lg border px-3 py-2 text-sm text-center ${role === 'both' ? 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300' : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300'}`}>
                  <input type="radio" name="role" value="both" className="mr-2" checked={role === 'both'} onChange={() => setRole('both')} />
                  Ambos
                </label>
              </div>

              <div>
                <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Tu Nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <label htmlFor="lastname" className="text-sm font-medium text-gray-700 dark:text-gray-300">Apellido</label>
                <Input
                  id="lastname"
                  type="text"
                  placeholder="Tu Apellido"
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
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
                <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">Contraseña</label>
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
                <Button type="submit" variant="primary" size="md">Registrarse</Button>
              </div>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              ¿Ya tienes una cuenta?{' '}
              <Link href="/login" className="font-medium text-blue-600 hover:underline dark:text-blue-400">Inicia sesión</Link>
            </p>

            {result && (
              <div className={`mt-6 rounded-lg border p-4 text-sm ${result.ok ? 'border-green-300 bg-green-50 text-green-800 dark:border-green-900/50 dark:bg-green-950/50 dark:text-green-300' : 'border-red-300 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300'}`}>
                {result.ok ? (
                  <>
                    <p className="font-medium">Se registró correctamente</p>
                    <pre className="mt-2 overflow-auto whitespace-pre-wrap break-words text-xs">{JSON.stringify(result.data, null, 2)}</pre>
                    <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">Guardé tu selección de rol en el dispositivo para completar tu perfil después de ingresar.</p>
                  </>
                ) : (
                  <p>{result.message}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}