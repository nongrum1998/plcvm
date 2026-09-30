import { decryptFields } from '@lib';
import { AxiosResponse } from 'axios';

export function decryptRequestResponse(response: AxiosResponse) {
  // 1. Check if there is actual data to decrypt (ignores empty responses like 204 No Content)
  if (!response.data.data || typeof response.data.data !== 'string') {
    return response;
  }

  // 2. Decrypt the data (using await in case decryptFields returns a Promise)
  const decryptedData = decryptFields(response.data?.data);

  // 3. Return the original response structure, overwriting only the 'data' property
  return {
    ...response,
    data: JSON.parse(decryptedData),
  };
}
