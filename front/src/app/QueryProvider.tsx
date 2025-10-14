'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React from 'react';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Con SSR, no queremos que las consultas se reintenten inmediatamente.
        // En su lugar, se reintentarán una vez que el componente se monte en el cliente.
        staleTime: 60 * 1000, // Los datos se consideran "frescos" por 1 minuto
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  // En el servidor, siempre crea un nuevo cliente para cada petición.
  // Esto evita que los datos de una petición se compartan accidentalmente entre usuarios.
  if (typeof window === 'undefined') {
    return makeQueryClient();
  }
  // En el cliente, usa un cliente singleton para que los datos se mantengan entre montajes de componentes.
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
