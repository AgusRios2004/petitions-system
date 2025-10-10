import apiClient from "./apiClient";

/**
 * Uploads an attachment file and associates it with a petition.
 * @param petitionId - The ID of the petition to associate the attachment with.
 * @param file - The file to upload.
 * @returns The response from the API, containing the new attachment's data.
 */
export const uploadAttachment = async (petitionId: number, file: File, name: string) => {
  const formData = new FormData();
  formData.append('id_petition', String(petitionId));
  formData.append('attachmentFile', file);
  formData.append('name', name); // Añadir el título personalizado al FormData

  const response = await apiClient.post("/api/attachments", formData, {
    headers: {
      // When using FormData, the browser automatically sets the
      // 'Content-Type' to 'multipart/form-data' with the correct boundary.
      // We don't need to set it manually.
    },
  });

  return response.data;
};
