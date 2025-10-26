import apiClient from './apiClient';

export const postulationService = {
    getAllPostulations: async (filters?: { id_state?: number; id_customer?: number; id_petition?: number; id_provider?: number; }) => {
        try {
            const response = await apiClient.get('/postulation', { params: filters });
            return response.data;
        } catch (error) {
            console.error('Error fetching all postulations:', error);
            throw error;
        }
    },

    getPostulationById: async (id: string) => {
        try {
            const response = await apiClient.get(`/postulation/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching postulation with ID ${id}:`, error);
            throw error;
        }
    },

    createPostulation: async (data: any) => {
        try {
            const response = await apiClient.post('/postulation', data);
            return response.data;
        } catch (error) {
            console.error('Error creating postulation:', error);
            throw error;
        }
    },

    updatePostulation: async (id: string, payload: any) => {
        try {
            const response = await apiClient.put(`/postulation/${id}`, payload);
            return response.data;
        } catch (error) {
            console.error(`Error updating postulation with ID ${id}:`, error);
            throw error;
        }
    },

    acceptPostulation: async (id: string) => {
        try {
            const response = await apiClient.patch(`/postulation/${id}/accept`);
            return response.data;
        } catch (error) {
            console.error(`Error accepting postulation with ID ${id}:`, error);
            throw error;
        }
    },

    declinePostulation: async (id: string, payload: { id_user_update: number; }) => {
        try {
            // Asegúrate de que el backend tenga este endpoint
            const response = await apiClient.patch(`/postulation/${id}/decline`, payload);
            return response.data;
        } catch (error) {
            console.error(`Error declining postulation with ID ${id}:`, error);
            throw error;
        }
    }
};