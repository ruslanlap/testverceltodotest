// src/lib/notion.ts
const API_BASE = process.env.NODE_ENV === 'production' 
? 'https://todo-eight-alpha.vercel.app/'
: '/api/todos';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

  export const notionApi = {
    async fetchTodos(): Promise<Todo[]> {
      const response = await fetch(API_BASE, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.todos;
    },

  async createTodo(text: string): Promise<Todo> {
    const response = await fetch(API_BASE, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  async updateTodo(id: string, data: { text?: string; completed?: boolean }): Promise<boolean> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    return result.success;
  },

  async deleteTodo(id: string): Promise<boolean> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result.success;
  },
};
