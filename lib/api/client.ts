import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

let apiClient: AxiosInstance | null = null;

export function getApiClient(): AxiosInstance {
  if (!apiClient) {
    apiClient = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    apiClient.interceptors.request.use((config) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (token) {
        config.headers.Authorization = 'Bearer ' + token;
      }
      return config;
    });

    apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            window.location.href = '/auth/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  return apiClient;
}

export const api = {
  auth: {
    signup: (email: string, password: string, firstName: string) =>
      getApiClient().post('/api/auth/signup', { email, password, firstName }),
    login: (email: string, password: string) =>
      getApiClient().post('/api/auth/login', { email, password }),
    logout: () => getApiClient().post('/api/auth/logout'),
    me: () => getApiClient().get('/api/auth/me'),
  },
  spaces: {
    create: () => getApiClient().post('/api/spaces/create'),
    join: (code: string) => getApiClient().post('/api/spaces/join', { code }),
    get: () => getApiClient().get('/api/spaces/current'),
    getStats: () => getApiClient().get('/api/spaces/stats'),
  },
  memories: {
    list: (params?: any) => getApiClient().get('/api/memories', { params }),
    create: (data: FormData) =>
      getApiClient().post('/api/memories/create', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    update: (id: string, data: any) => getApiClient().put('/api/memories/' + id, data),
    delete: (id: string) => getApiClient().delete('/api/memories/' + id),
  },
  reactions: {
    list: (memoryId?: string) =>
      getApiClient().get('/api/reactions', { params: memoryId ? { memoryId } : undefined }),
    add: (memoryId: string, emoji: string) =>
      getApiClient().post('/api/reactions', { memoryId, emoji }),
    remove: (reactionId: string) => getApiClient().delete('/api/reactions/' + reactionId),
  },
  notifications: {
    list: () => getApiClient().get('/api/notifications'),
    markAsRead: (id: string) => getApiClient().put('/api/notifications/' + id + '/read'),
  },
};
