// frontend/notion.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://doapp-ten.vercel.app/api';

export async function fetchTodos() {
  const response = await fetch(`${API_BASE_URL}/notion/todos`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch todos: ${error}`);
  }

  return response.json();
}

export async function createTodo(text: string) {
  const response = await fetch(`${API_BASE_URL}/notion/todos`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create todo: ${error}`);
  }

  return response.json();
}