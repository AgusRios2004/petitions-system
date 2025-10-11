import apiClient from "./apiClient";

/**
 * Creates a new petition by sending the petition data as a JSON payload.
 * @param payload - An object containing the petition data (description, ids, dates, etc.).
 * @returns The response from the API, containing the newly created petition.
 */
export const createPetition = async (payload: any) => {
  const response = await apiClient.post("/api/petition", payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  console.log('API Response:', response.data);
  return response.data;
};
