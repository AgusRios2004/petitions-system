// front/src/service/socketService.ts

import { io, Socket } from "socket.io-client";

// 1. Definimos la URL base del servidor, igual que en apiClient pero sin '/api'.
const URL = process.env.NEXT_PUBLIC_API_URL 
  ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') 
  : "http://localhost:3000";

// 2. Esta variable guardará la única instancia de nuestro socket.
//    Al estar fuera de cualquier función, actúa como un "singleton".
let socket: Socket | null = null;

// Función para crear y conectar el socket.
export const connectSocket = (token: string) => {
  // Si ya existe una instancia del socket, no hacemos nada.
  // Esto previene la creación de múltiples conexiones.
  if (socket) {
    return;
  }

  // Creamos la nueva instancia con la autenticación.
  console.log(`Conectando socket a ${URL}`);
  socket = io(URL, {
    auth: { token },
    transports: ['websocket'], // Forzar WebSocket para mayor estabilidad
    autoConnect: true, // Asegura que intente conectar automáticamente.
  });
};

// Debajo de connectSocket

// Función para desconectar el socket.
export const disconnectSocket = () => {
  if (socket) {
    console.log('Desconectando socket...');
    socket.disconnect();
    socket = null;
  }
};

// Función para obtener la instancia actual del socket.
export const getSocket = (): Socket | null => {
  return socket;
};