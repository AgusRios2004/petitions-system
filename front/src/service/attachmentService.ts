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

  const response = await apiClient.post("/api/attachments", formData);

  console.log('API Response:', response.data);
  return response.data;
};

export const deleteAttachment = async (attachmentId: number) => {
  const response = await apiClient.delete(`/api/attachments/${attachmentId}`);
  return response.data;
};