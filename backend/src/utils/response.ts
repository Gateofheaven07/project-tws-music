export interface ApiResponse<T = any> {
  success: boolean;
  status: number;
  message: string;
  meta?: {
    query?: string;
    total?: number;
    provider?: {
      metadata: string;
      playback: string;
    };
    playbackStatus?: string;
  };
  data?: T;
  results?: T extends Array<any> ? T : never;
  timestamp: string;
  error?: string;
}

export const createSuccessResponse = <T>(
  status: number,
  message: string,
  data?: T,
  meta?: ApiResponse['meta']
): ApiResponse<T> => {
  const response: ApiResponse<T> = {
    success: true,
    status,
    message,
    timestamp: new Date().toISOString(),
  };

  if (meta) {
    response.meta = meta;
  }

  if (Array.isArray(data)) {
    response.results = data as any;
  } else {
    response.data = data;
  }

  return response;
};

export const createErrorResponse = (
  status: number,
  message: string,
  error?: string
): ApiResponse => {
  return {
    success: false,
    status,
    message,
    timestamp: new Date().toISOString(),
    error,
  };
};
