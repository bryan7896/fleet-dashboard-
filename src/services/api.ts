import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { API_BASE_URL } from '../utils/constants'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (import.meta.env.DEV) {
          console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data)
        }
        return config
      },
      (error: AxiosError) => {
        console.error('[API Request Error]', error)
        return Promise.reject(error)
      }
    )

    this.client.interceptors.response.use(
      (response) => {
        if (import.meta.env.DEV) {
          console.log(`[API Response] ${response.config.url}`, response.data)
        }
        return response
      },
      (error: AxiosError) => {
        if (error.response) {
          console.error('[API Response Error]', {
            status: error.response.status,
            data: error.response.data,
            url: error.config?.url,
          })

          switch (error.response.status) {
            case 404:
              console.warn('Resource not found')
              break
            case 500:
              console.error('Server error')
              break
            default:
              break
          }
        } else if (error.request) {
          console.error('[API No Response]', error.request)
        } else {
          console.error('[API Error]', error.message)
        }
        return Promise.reject(error)
      }
    )
  }

  public getClient(): AxiosInstance {
    return this.client
  }
}

export const apiClient = new ApiClient().getClient()

export async function fetchAPI<T>(
  url: string,
  options?: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    body?: unknown
  }
): Promise<T> {
  const response = await apiClient.request<T>({
    url,
    method: options?.method || 'GET',
    data: options?.body,
  })
  return response.data
}