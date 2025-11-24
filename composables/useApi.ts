import type { ApiResponse } from '~/types'

export const useApi = () => {
  const config = useRuntimeConfig()

  const apiBase = (config.public.apiBase as string) || '/api'

  const api = $fetch.create({
    baseURL: apiBase,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const get = async <T>(url: string): Promise<ApiResponse<T>> => {
    try {
      const data = await api<T>(url, { method: 'GET' })
      return { success: true, data: data as T }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'An error occurred',
        message: 'Failed to fetch data',
      }
    }
  }

  const post = async <T>(url: string, body: any): Promise<ApiResponse<T>> => {
    try {
      const data = await api<T>(url, {
        method: 'POST',
        body,
      })
      return { success: true, data: data as T }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'An error occurred',
        message: 'Failed to post data',
      }
    }
  }

  const put = async <T>(url: string, body: any): Promise<ApiResponse<T>> => {
    try {
      const data = await api<T>(url, {
        method: 'PUT',
        body,
      })
      return { success: true, data: data as T }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'An error occurred',
        message: 'Failed to update data',
      }
    }
  }

  const del = async <T>(url: string): Promise<ApiResponse<T>> => {
    try {
      const data = await api<T>(url, { method: 'DELETE' })
      return { success: true, data: data as T }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'An error occurred',
        message: 'Failed to delete data',
      }
    }
  }

  return {
    get,
    post,
    put,
    delete: del,
  }
}
