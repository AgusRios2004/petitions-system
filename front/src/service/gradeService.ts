import apiClient from "./apiClient";
import { ApiResponse, IGradeForm, IGrade } from "@/types/common";

export const gradeService = {
  createGrade: async (payload: any) => {
    try {
      const response = await apiClient.post("/grade", payload);
      return response.data.data;
    } catch (e: any) {
      console.log(e);
      throw e.message;
    }
  },
}