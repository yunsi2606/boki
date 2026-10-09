import type { ApiError } from '@/types';

export class ApiRequestError extends Error {
  status: number;
  error: string;
  details?: { field: string; message: string }[];
  timestamp?: string;
  path?: string;

  constructor(data: ApiError) {
    const detailMsg =
      data.details && data.details.length > 0
        ? data.details.map((d) => `${d.field}: ${d.message}`).join(', ')
        : null;
    const fullMsg = detailMsg
      ? `${data.message || 'Lỗi dữ liệu'}: ${detailMsg}`
      : data.message || data.error || 'Yêu cầu API thất bại';
    super(fullMsg);
    this.name = 'ApiRequestError';
    this.status = data.status;
    this.error = data.error;
    this.details = data.details;
    this.timestamp = data.timestamp;
    this.path = data.path;
  }
}
