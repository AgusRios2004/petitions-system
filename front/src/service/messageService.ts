import api from './apiClient'; // Asumimos que tienes un cliente axios configurado.
import { IConversationPreview, IMessage } from '../types/common';

/**
 * Contiene todos los métodos para interactuar con la API de mensajería.
 */

/**
 * Obtiene la lista de todas las conversaciones del usuario autenticado.
 * @returns Una promesa que se resuelve en un array de vistas previas de conversaciones.
 */
export const getConversations = async (): Promise<IConversationPreview[]> => {
  try {
    const response = await api.get<{ data: IConversationPreview[] }>('/conversations');
    return response.data.data;
  } catch (error) {
    console.error('Error al obtener las conversaciones:', error);
    throw error;
  }
};

/**
 * Obtiene todos los mensajes de una conversación específica.
 * @param conversationId - El ID de la conversación.
 * @returns Una promesa que se resuelve en un array de mensajes.
 */
export const getMessagesByConversation = async (conversationId: number): Promise<IMessage[]> => {
  try {
    const response = await api.get<{ data: IMessage[] }>(`/conversation/${conversationId}/messages`);
    return response.data.data;
  } catch (error) {
    console.error(`Error al obtener los mensajes para la conversación ${conversationId}:`, error);
    throw error;
  }
};

/**
 * Envía un nuevo mensaje a una conversación.
 * @param conversationId - El ID de la conversación.
 * @param content - El contenido del mensaje.
 * @returns Una promesa que se resuelve con el mensaje recién creado.
 */
export const createMessage = async (conversationId: number, content: string): Promise<IMessage> => {
  try {
    const response = await api.post<{ data: IMessage }>('/message', { idConversation: conversationId, content });
    return response.data.data;
  } catch (error) {
    console.error('Error al crear el mensaje:', error);
    throw error;
  }
};

/**
 * Inicia o encuentra una conversación con otro usuario.
 * @param recipientId - El ID del usuario con el que se quiere iniciar la conversación.
 * @returns Una promesa que se resuelve con los datos de la conversación.
 */
export const startConversation = async (recipientId: number, petitionId: number): Promise<{ id_conversation: number }> => {
  try {
    // Ahora enviamos también el petitionId
    const response = await api.post<{ data: { id_conversation: number } }>('/conversation/start', { recipientId, petitionId });
    return response.data.data;
  } catch (error) {
    console.error('Error al iniciar la conversación:', error);
    throw error;
  }
};
