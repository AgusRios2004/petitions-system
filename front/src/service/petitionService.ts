import { api } from "@/WebApiResponse/api";

/**
 * Creates a new petition by sending form data, including attachments, to the backend.
 * @param formData - The FormData object containing the petition data and files.
 * @returns The response from the API.
 */
export const createPetition = async (formData: FormData) => {
  const response = await api.post("/petitions", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};
