import { API_BASE_URL, TOKEN_STORAGE_KEY } from '@/lib/constants';

export interface UploadResponse {
  url: string;
  filename: string;
}

export const mediaService = {
  async uploadMedia(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_STORAGE_KEY) : null;
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/v1/media/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => null);
      const errorMessage = errData?.error || `Upload failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  },
};
