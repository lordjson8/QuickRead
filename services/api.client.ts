/**
 * API Client
 * Centralized API client with error handling, retry logic, and interceptors
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiError, ApiResponse, RequestConfig } from '@/types';
import config from '@/config/env';
import logger from './logger';
import { authService } from './auth.service';

class ApiClient {
  private client: AxiosInstance;
  private maxRetries: number;

  constructor() {
    this.maxRetries = config.maxRetries;

    this.client = axios.create({
      baseURL: config.apiUrl,
      timeout: config.apiTimeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const authState = await authService.getAuthToken();
        
        if (authState?.accessToken) {
          config.headers.Authorization = `Bearer ${authState.accessToken}`;
        }

        logger.debug('API Request', {
          method: config.method,
          url: config.url,
          params: config.params,
        });

        return config;
      },
      (error) => {
        logger.error('Request interceptor error', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle errors
    this.client.interceptors.response.use(
      (response) => {
        logger.debug('API Response', {
          status: response.status,
          url: response.config.url,
        });
        return response;
      },
      async (error: AxiosError) => {
        return this.handleResponseError(error);
      }
    );
  }

  private async handleResponseError(error: AxiosError): Promise<never> {
    const apiError: ApiError = {
      status: error.response?.status || 500,
      message: this.getErrorMessage(error),
      code: error.code,
      details: error.response?.data,
    };

    logger.error('API Error', error, {
      status: apiError.status,
      url: error.config?.url,
    });

    // Handle specific error codes
    if (apiError.status === 401) {
      // Unauthorized - clear auth data
      await authService.clearAuthData();
      // You might want to redirect to login here
    }

    throw apiError;
  }

  private getErrorMessage(error: AxiosError): string {
    if (error.response) {
      // Server responded with error
      const data: any = error.response.data;
      return data?.message || data?.error || 'Server error occurred';
    } else if (error.request) {
      // Request made but no response
      return 'Network error. Please check your connection.';
    } else {
      // Error in request setup
      return error.message || 'An unexpected error occurred';
    }
  }

  private async retryRequest<T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    retries: number = this.maxRetries
  ): Promise<AxiosResponse<T>> {
    try {
      return await requestFn();
    } catch (error) {
      if (retries > 0 && this.shouldRetry(error as AxiosError)) {
        logger.debug(`Retrying request. Attempts remaining: ${retries}`);
        await this.delay(1000 * (this.maxRetries - retries + 1)); // Exponential backoff
        return this.retryRequest(requestFn, retries - 1);
      }
      throw error;
    }
  }

  private shouldRetry(error: AxiosError): boolean {
    // Retry on network errors or 5xx server errors
    return (
      !error.response ||
      (error.response.status >= 500 && error.response.status < 600)
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Public methods

  async get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.retryRequest<T>(() =>
      this.client.get<T>(url, config)
    );
    return {
      data: response.data,
      status: response.status,
    };
  }

  async post<T, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.post<T>(url, data, config);
    return {
      data: response.data,
      status: response.status,
    };
  }

  async put<T, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.put<T>(url, data, config);
    return {
      data: response.data,
      status: response.status,
    };
  }

  async patch<T, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.patch<T>(url, data, config);
    return {
      data: response.data,
      status: response.status,
    };
  }

  async delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.delete<T>(url, config);
    return {
      data: response.data,
      status: response.status,
    };
  }
  
}

export const apiClient = new ApiClient();
export default apiClient;