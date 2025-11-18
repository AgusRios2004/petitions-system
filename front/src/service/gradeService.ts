import apiClient from "./apiClient";
import { ApiResponse, IGradeForm, IGrade } from "@/types/common";

export const gradeService = {
  // 1. Reemplazamos 'any' con la interfaz correcta 'IGradeForm'.
  // Ahora TypeScript se quejará si el objeto no tiene la forma correcta.
  createGrade: async (payload: IGradeForm) => {
    try {
      // 2. Imprimimos el payload para ver qué se está enviando exactamente.
      console.log("Enviando payload de calificación:", payload);
      const response = await apiClient.post("/grade", payload);
      return response.data.data;
    } catch (e: any) {
      console.log(e);
      throw e.message;
    }
  },
}