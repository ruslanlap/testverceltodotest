import { BlockObjectResponse, PartialBlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';

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

export interface NotionTodoBlock extends BlockObjectResponse {
  type: 'to_do';
  to_do: {
    rich_text: Array<{
      type: 'text';
      text: {
        content: string;
      };
    }>;
    checked: boolean;
  };
}