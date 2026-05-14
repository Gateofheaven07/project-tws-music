export interface ApiResponse<T = any> {
  success: boolean;
  status: number;
  message: string;
  data?: T;
  results?: T extends Array<any> ? T : never;
  error?: string;
}

export const createSuccessResponse = <T>(
  status: number,
  message: string,
  data?: T
): ApiResponse<T> => {
  const response: ApiResponse<T> = {
    success: true,
    status,
    message,
  };

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
    error,
  };
};
