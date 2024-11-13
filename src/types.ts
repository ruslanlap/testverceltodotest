// src/types.ts
import { 
  BlockObjectResponse,
  PartialBlockObjectResponse,
  ToDoBlockObjectResponse
} from '@notionhq/client/build/src/api-endpoints';

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