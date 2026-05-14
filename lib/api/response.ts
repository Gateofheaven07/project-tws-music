export interface ApiResponse<T = any> {
  success: boolean;
  status: number;
  message: string;
  data?: T;
  error?: string;
}

export const createSuccessResponse = <T>(
  status: number,
  message: string,
  data?: T
): ApiResponse<T> => {
  return {
    success: true,
    status,
    message,
    data,
  };
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
