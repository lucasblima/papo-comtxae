import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

// Base API URL from environment variables
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Error types
export enum ApiErrorType {
  NETWORK = 'network',
  SERVER = 'server',
  AUTH = 'auth',
  VALIDATION = 'validation',
  NOT_FOUND = 'not_found',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown',
}

// API error interface
export interface ApiError {
  type: ApiErrorType;
  status?: number;
  message: string;
  details?: any;
  original?: Error;
}

// Response interface for API calls
export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  success: boolean;
}

// Retry configuration
interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  retryStatusCodes: number[];
}

// Default retry configuration
const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  retryStatusCodes: [408, 429, 500, 502, 503, 504],
};

/**
 * Parse error from API responses
 */
export function parseApiError(error: any): ApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    
    // Network errors
    if (axiosError.code === 'ECONNABORTED') {
      return {
        type: ApiErrorType.TIMEOUT,
        message: 'Request timed out',
        original: error,
      };
    }
    
    if (!axiosError.response) {
      return {
        type: ApiErrorType.NETWORK,
        message: 'Network error occurred',
        original: error,
      };
    }
    
    // HTTP status based errors
    const status = axiosError.response.status;
    const data = axiosError.response.data as any;
    
    switch (true) {
      case status === 401:
        return {
          type: ApiErrorType.AUTH,
          status,
          message: 'Authentication failed',
          details: data,
          original: error,
        };
      case status === 403:
        return {
          type: ApiErrorType.AUTH,
          status,
          message: 'Not authorized to perform this action',
          details: data,
          original: error,
        };
      case status === 404:
        return {
          type: ApiErrorType.NOT_FOUND,
          status,
          message: 'Resource not found',
          details: data,
          original: error,
        };
      case status === 422:
        return {
          type: ApiErrorType.VALIDATION,
          status,
          message: 'Validation error',
          details: data,
          original: error,
        };
      case status >= 500:
        return {
          type: ApiErrorType.SERVER,
          status,
          message: 'Server error occurred',
          details: data,
          original: error,
        };
      default:
        return {
          type: ApiErrorType.UNKNOWN,
          status,
          message: data?.message || 'Unknown error occurred',
          details: data,
          original: error,
        };
    }
  }
  
  // Generic errors
  return {
    type: ApiErrorType.UNKNOWN,
    message: error?.message || 'Unknown error occurred',
    original: error,
  };
}

/**
 * Generic API request function with retry logic and error handling
 */
export async function apiRequest<T>(
  config: AxiosRequestConfig,
  retryConfig: Partial<RetryConfig> = {}
): Promise<ApiResponse<T>> {
  const finalRetryConfig = { ...defaultRetryConfig, ...retryConfig };
  let retries = 0;
  
  const makeRequest = async (): Promise<ApiResponse<T>> => {
    try {
      const response = await axios({
        baseURL: API_URL,
        timeout: 10000,
        ...config,
      });
      
      return {
        data: response.data,
        success: true,
      };
    } catch (error) {
      const parsedError = parseApiError(error);
      
      // Determine if we should retry
      const shouldRetry = 
        retries < finalRetryConfig.maxRetries &&
        (parsedError.type === ApiErrorType.NETWORK ||
          (parsedError.status && finalRetryConfig.retryStatusCodes.includes(parsedError.status)));
      
      if (shouldRetry) {
        retries++;
        const delay = finalRetryConfig.retryDelay * retries;
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
        return makeRequest();
      }
      
      return {
        error: parsedError,
        success: false,
      };
    }
  };
  
  return makeRequest();
}

/**
 * GET request helper
 */
export async function get<T>(
  url: string,
  params?: any,
  config: Partial<AxiosRequestConfig> = {}
): Promise<ApiResponse<T>> {
  return apiRequest<T>({
    method: 'GET',
    url,
    params,
    ...config,
  });
}

/**
 * POST request helper
 */
export async function post<T>(
  url: string,
  data?: any,
  config: Partial<AxiosRequestConfig> = {}
): Promise<ApiResponse<T>> {
  return apiRequest<T>({
    method: 'POST',
    url,
    data,
    ...config,
  });
}

/**
 * PUT request helper
 */
export async function put<T>(
  url: string,
  data?: any,
  config: Partial<AxiosRequestConfig> = {}
): Promise<ApiResponse<T>> {
  return apiRequest<T>({
    method: 'PUT',
    url,
    data,
    ...config,
  });
}

/**
 * DELETE request helper
 */
export async function del<T>(
  url: string,
  config: Partial<AxiosRequestConfig> = {}
): Promise<ApiResponse<T>> {
  return apiRequest<T>({
    method: 'DELETE',
    url,
    ...config,
  });
} 