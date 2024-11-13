// config.ts
export const getApiConfig = () => {
  const env = process.env.NODE_ENV;
  const config = {
    production: {
      baseUrl: 'https://todovercel-zeta.vercel.app/api/todos'
    },
    development: {
      baseUrl: '/api/todos'
    }
  };

  return config[env as keyof typeof config] || config.development;
};

// types.ts
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// api.ts
import { getApiConfig } from './config';
import type { Todo, ApiResponse } from './types';

class TodoApi {
  private baseUrl: string;

  constructor() {
    this.baseUrl = getApiConfig().baseUrl;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  private async fetchWithConfig(
    endpoint: string, 
    config: RequestInit
  ): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`;
    return fetch(url, {
      ...config,
      headers: {
        "Content-Type": "application/json",
        ...config.headers,
      },
    });
  }

  async fetchTodos(): Promise<Todo[]> {
    const response = await this.fetchWithConfig("", { method: "GET" });
    const data = await this.handleResponse<ApiResponse<Todo[]>>(response);
    return data.data;
  }

  async createTodo(text: string): Promise<Todo> {
    const response = await this.fetchWithConfig("", {
      method: "POST",
      body: JSON.stringify({ text }),
    });
    return this.handleResponse<Todo>(response);
  }

  async updateTodo(
    id: string,
    data: Partial<Pick<Todo, "text" | "completed">>
  ): Promise<boolean> {
    const response = await this.fetchWithConfig(`/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    const result = await this.handleResponse<ApiResponse<null>>(response);
    return result.success;
  }

  async deleteTodo(id: string): Promise<boolean> {
    const response = await this.fetchWithConfig(`/${id}`, {
      method: "DELETE",
    });
    const result = await this.handleResponse<ApiResponse<null>>(response);
    return result.success;
  }
}

export const todoApi = new TodoApi();