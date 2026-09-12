import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

export const apiClient: AxiosInstance = axios.create({
  baseURL: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const message = (error.response?.data as { error?: string })?.error || error.message;
    console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, message);
    return Promise.reject(error);
  }
);

export interface TickPayload {
  prompt: string;
  worldState: unknown;
  tickNumber: number;
  previousOutcomes?: string;
}

export interface TickResponse {
  success: boolean;
  thought?: string;
  actions?: { tool: string; args: string }[];
  error?: string;
}

export async function postAgentTick(payload: TickPayload): Promise<TickResponse> {
  const response = await apiClient.post<TickResponse>('/api/agent/tick', payload);
  return response.data;
}

export async function fetchSimState(): Promise<unknown> {
  const response = await apiClient.get('/api/sim');
  return response.data;
}

export async function updateSimState(data: unknown): Promise<unknown> {
  const response = await apiClient.post('/api/sim', data);
  return response.data;
}

export async function fetchWorldBlocks(): Promise<unknown> {
  const response = await apiClient.get('/api/world/blocks');
  return response.data;
}

export async function saveWorldBlock(block: unknown): Promise<unknown> {
  const response = await apiClient.post('/api/world/blocks', block);
  return response.data;
}
