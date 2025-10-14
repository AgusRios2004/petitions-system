import apiClient from "./apiClient";

/**
 * Creates a new petition by sending the petition data as a JSON payload.
 * @param payload - An object containing the petition data (description, ids, dates, etc.).
 * @returns The response from the API, containing the newly created petition.
 */
export const createPetition = async (payload: any) => {
  const response = await apiClient.post("/api/petition", payload);
  console.log('API Response:', response.data);
  return response.data;
};

/**
 * Gets a paginated and filtered list of petitions.
 * @param params - An object containing query parameters like page, limit, id_state, id_customer, description, etc.
 * @returns The paginated response from the API.
 */
export const getPetitions = async (params: any) => {
  const response = await apiClient.get("/api/petition", { params });
  return response.data;
};
