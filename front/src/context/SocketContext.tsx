'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';
import { connectSocket, disconnectSocket, getSocket } from '@/service/socketService'; // 1. Apuntamos al archivo correcto
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query'; // Para refrescar datos automáticamente

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
};

export const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    
    const { user } = useAuth();
    const queryClient= useQueryClient();

    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if(user) {
            const token = localStorage.getItem('accessToken');
            if(!token) return;

            // 2. Usamos el servicio para iniciar la conexión.
            connectSocket(token);
            const socketInstance = getSocket();

            if (socketInstance) {
                setSocket(socketInstance);

                // --- REGISTRO DE EVENTOS ---
                // Esta función se encargará de registrar todos nuestros listeners.
                const setupEventListeners = (socket: Socket) => {
                  console.log('Registrando listeners de eventos del socket...');

                  socket.on('connect', () => {
                    setIsConnected(true);
                    console.log("✅ Socket conectado:", socket.id);
                  });

                  socket.on('disconnect', () => {
                    setIsConnected(false);
                    console.log("❌ Socket desconectado.");
                  });

                  socket.on('new_postulation', (data) => {
                    toast.success("¡Has recibido una nueva postulación!");
                    queryClient.invalidateQueries({ queryKey: ['postulations', data.id_petition] });
                    queryClient.invalidateQueries({ queryKey: ['petitions'] });
                  });

                  socket.on('postulation_accepted', (data) => {
                    toast.success("¡Felicidades! Tu postulación ha sido aceptada.");
                    queryClient.invalidateQueries({ queryKey: ['postulations'] });
                    queryClient.invalidateQueries({ queryKey: ['petitions'] });
                  });

                  socket.on('new_petition', (data) => {
                    toast.success('Nueva petición disponible en tu área.');
                    queryClient.invalidateQueries({ queryKey: ['petitions'] });
                  });
                  
                  socket.on('postulation_rejected', (data) => {
                    toast.error('Una de tus postulaciones fue rechazada.');
                    queryClient.invalidateQueries({ queryKey: ['postulations'] });
                  });

                  socket.on('postulation_withdrawn', (data) => {
                    toast.error('Un proveedor ha retirado su postulación.');
                    queryClient.invalidateQueries({ queryKey: ['postulations', data.id_petition] });
                  });
                };

                setupEventListeners(socketInstance);
            }

            return () => {
                console.log('Limpiando y desconectando socket...');
                disconnectSocket(); // 3. Usamos el servicio para desconectar y limpiar la instancia.
                setSocket(null);
                setIsConnected(false);
            }
        }
    }, [user, queryClient]);

    return ( 
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    )
}