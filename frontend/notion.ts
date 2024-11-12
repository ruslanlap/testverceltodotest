// frontend/src/api/notion.ts
import { BlockObjectResponse, PartialBlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

function isFullBlock(block: BlockObjectResponse | PartialBlockObjectResponse): block is BlockObjectResponse {
  return 'created_time' in block;
}

function isToDoBlock(block: BlockObjectResponse): block is BlockObjectResponse & { type: 'to_do' } {
  return block.type === 'to_do';
}

export const notionApi = {
  async fetchTodos(): Promise<Todo[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/todos`);
      if (!response.ok) throw new Error('Failed to fetch todos');

      const data = await response.json();

      return data.results
        .filter((block: any): block is BlockObjectResponse => isFullBlock(block))
        .filter(isToDoBlock)
        .map((block) => ({
          id: block.id,
          text: block.to_do.rich_text[0]?.plain_text || '',
          completed: block.to_do.checked || false,
          createdAt: new Date(block.created_time).getTime(),
        }));
    } catch (error) {
      console.error('Error fetching todos:', error);
      throw error;
    }
  },

  async createTodo(text: string): Promise<Todo> {
    try {
      const response = await fetch(`${API_BASE_URL}/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error('Failed to create todo');

      const data = await response.json();
      const newBlock = data.results[0];

      if (!isFullBlock(newBlock) || !isToDoBlock(newBlock)) {
        throw new Error('Invalid block response from API');
      }

      return {
        id: newBlock.id,
        text,
        completed: false,
        createdAt: new Date(newBlock.created_time).getTime(),
      };
    } catch (error) {
      console.error('Error creating todo:', error);
      throw error;
    }
  },

  async updateTodo(
    id: string, 
    { text, completed }: { text?: string; completed?: boolean }
  ): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, completed }),
      });

      if (!response.ok) throw new Error('Failed to update todo');

      return true;
    } catch (error) {
      console.error('Error updating todo:', error);
      throw error;
    }
  },

  async deleteTodo(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete todo');

      return true;
    } catch (error) {
      console.error('Error deleting todo:', error);
      throw error;
    }
  },
};