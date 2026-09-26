import type {
  ApiErrorResponse,
  MemoriesResponse,
  Reaction,
  ReactionsResponse,
  SessionResponse,
  SecretsResponse,
  SharedSpace,
  Streak,
} from './types';
import { fetch } from 'expo/fetch';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function getApiBaseUrl(): string {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, '');
  if (!baseUrl) {
    throw new Error(
      'Configurez EXPO_PUBLIC_API_URL dans mobile/.env pour connecter l’application au serveur.',
    );
  }
  return baseUrl;
}

export async function apiRequest<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST';
    token?: string | null;
    body?: Record<string, unknown> | FormData;
  } = {},
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  const isFormData = options.body instanceof FormData;
  let requestBody: BodyInit | undefined;
  if (isFormData) {
    requestBody = options.body as FormData;
  } else if (options.body) {
    requestBody = JSON.stringify(options.body);
  }

  if (options.body && !isFormData) headers['Content-Type'] = 'application/json';
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  let response: Response;
  const apiBaseUrl = getApiBaseUrl();
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: requestBody,
    });
  } catch {
    throw new Error(
      'Serveur injoignable. Vérifiez l’adresse EXPO_PUBLIC_API_URL et votre connexion réseau.',
    );
  }

  let data: T & ApiErrorResponse;
  try {
    data = (await response.json()) as T & ApiErrorResponse;
  } catch {
    throw new ApiError('Le serveur a renvoyé une réponse illisible.', response.status);
  }

  if (!response.ok) {
    throw new ApiError(data.message || 'Une erreur est survenue.', response.status);
  }

  return data;
}

export const api = {
  login: (email: string, password: string) =>
    apiRequest<SessionResponse>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    }),
  signup: (firstName: string, email: string, password: string) =>
    apiRequest<SessionResponse>('/api/auth/signup', {
      method: 'POST',
      body: { firstName, email, password },
    }),
  me: (token: string) => apiRequest<SessionResponse>('/api/auth/me', { token }),
  createSpace: (token: string) =>
    apiRequest<{ code: string }>('/api/spaces/create', { method: 'POST', token }),
  joinSpace: (token: string, code: string) =>
    apiRequest<{ space: SharedSpace }>('/api/spaces/join', {
      method: 'POST',
      token,
      body: { code },
    }),
  memories: (token: string) => apiRequest<MemoriesResponse>('/api/memories?limit=50', { token }),
  createMemory: (
    token: string,
    memory: { type: 'word' | 'mood'; content: string; mood?: string },
  ) =>
    apiRequest('/api/memories', {
      method: 'POST',
      token,
      body: memory,
    }),
  createMemoryForm: (token: string, formData: FormData) =>
    apiRequest('/api/memories', {
      method: 'POST',
      token,
      body: formData,
    }),
  reactions: (token: string) => apiRequest<ReactionsResponse>('/api/reactions', { token }),
  secrets: (token: string) => apiRequest<SecretsResponse>('/api/secrets', { token }),
  createSecret: (
    token: string,
    secret: { title: string; content: string; opensAt: string },
  ) =>
    apiRequest<{ secret: SecretsResponse['secrets'][number] }>('/api/secrets', {
      method: 'POST',
      token,
      body: secret,
    }),
  addReaction: (token: string, memoryId: string, emoji: string) =>
    apiRequest<{ reaction: Reaction }>('/api/reactions', {
      method: 'POST',
      token,
      body: { memoryId, emoji },
    }),
  streak: (token: string) => apiRequest<{ streak: Streak | null }>('/api/streak', { token }),
};
