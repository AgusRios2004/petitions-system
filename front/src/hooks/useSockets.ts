import { useContext } from 'react';
import { SocketContext } from '@/context/SocketContext';

/**
 * Custom hook para acceder al contexto del socket.
 * Proporciona una forma limpia y segura de obtener el estado del socket.
 * @returns El valor del SocketContext (socket, isConnected).
 * @throws {Error} Si se usa fuera de un SocketProvider.
 */
export const useSocket = () => {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error('useSocket debe ser usado dentro de un SocketProvider');
  }

  return context;
};
