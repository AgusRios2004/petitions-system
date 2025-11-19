import apiClient from "./apiClient";
import { ApiResponse, IGradeForm } from "@/types/common";

export const gradeService = {
  createGrade: async (payload: IGradeForm) => {
    try {
      const response = await apiClient.post("/grade", payload);
      return response.data.data;
    } catch (e: any) {
      console.log(e);
      throw e.response?.data?.message;
    }
  },
}