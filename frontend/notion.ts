const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://doit-tau.vercel.app/api';

export async function fetchTodos() {
  const response = await fetch(`${API_BASE_URL}/notion/todos`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch todos');
  }

  return response.json();
}