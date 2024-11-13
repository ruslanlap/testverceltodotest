const NOTION_API_KEY = import.meta.env.VITE_NOTION_API_KEY;
const YOUR_PAGE_ID = import.meta.env.VITE_YOUR_PAGE_ID;

// Використовуємо повний URL для production
const NOTION_API_URL = import.meta.env.PROD 
  ? 'https://doit-tau.vercel.app/api/notion'  // Повний URL для production
  : '/api/notion'; // Для локальної розробки

console.log('API URL:', NOTION_API_URL);
console.log('Page ID:', YOUR_PAGE_ID);

interface NotionBlock {
  id: string;
  type: string;
  to_do: {
    rich_text: Array<{ text: { content: string } }>;
    checked: boolean;
  };
  created_time: string;
}

interface NotionBlockResponse {
  results: NotionBlock[];
}

// Налаштування headers
const getHeaders = () => ({
  'Authorization': `Bearer ${NOTION_API_KEY}`,
  'Notion-Version': '2022-06-28',
  'Content-Type': 'application/json'
});

export const notionApi = {
  async fetchTodos() {
    try {
      const url = `${NOTION_API_URL}/blocks/${YOUR_PAGE_ID}/children`;
      console.log('Fetching todos from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'same-origin', // Змінено з 'include' на 'same-origin'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error response:', {
          status: response.status,
          text: errorText,
          url: url
        });
        throw new Error(`Failed to fetch todos: ${response.status}`);
      }

      const data: NotionBlockResponse = await response.json();
      console.log('Successfully fetched data:', data);

      return data.results
        .filter((block: NotionBlock) => block.type === 'to_do')
        .map(block => ({
          id: block.id,
          text: block.to_do.rich_text[0]?.text?.content || '',
          completed: block.to_do.checked || false,
          createdAt: new Date(block.created_time).getTime(),
        }));
    } catch (error) {
      console.error('Error in fetchTodos:', error);
      throw error;
    }
  },

  async createTodo(text: string) {
    try {
      const url = `${NOTION_API_URL}/blocks/${YOUR_PAGE_ID}/children`;
      console.log('Creating todo at:', url);

      const response = await fetch(url, {
        method: 'PATCH',
        headers: getHeaders(),
        credentials: 'same-origin',
        body: JSON.stringify({
          children: [{
            object: 'block',
            type: 'to_do',
            to_do: {
              rich_text: [{ 
                type: 'text',
                text: { content: text }
              }],
              checked: false
            }
          }]
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Create todo error:', {
          status: response.status,
          text: errorText,
          url: url
        });
        throw new Error(`Failed to create todo: ${response.status}`);
      }

      const data = await response.json();
      console.log('Created todo response:', data);

      return {
        id: data.results[0].id,
        text,
        completed: false,
        createdAt: new Date(data.results[0].created_time).getTime(),
      };
    } catch (error) {
      console.error('Error creating todo:', error);
      throw error;
    }
  },

  async updateTodo(id: string, { text, completed }: { text?: string; completed?: boolean }) {
    try {
      const url = `${NOTION_API_URL}/blocks/${id}`;
      console.log('Updating todo at:', url);

      const updateData: any = {
        to_do: {}
      };

      if (text !== undefined) {
        updateData.to_do.rich_text = [{
          type: 'text',
          text: { content: text }
        }];
      }

      if (completed !== undefined) {
        updateData.to_do.checked = completed;
      }

      const response = await fetch(url, {
        method: 'PATCH',
        headers: getHeaders(),
        credentials: 'same-origin',
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Update todo error:', {
          status: response.status,
          text: errorText,
          url: url
        });
        throw new Error(`Failed to update todo: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error updating todo:', error);
      throw error;
    }
  },

  async deleteTodo(id: string) {
    try {
      const url = `${NOTION_API_URL}/blocks/${id}`;
      console.log('Deleting todo at:', url);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: getHeaders(),
        credentials: 'same-origin'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Delete todo error:', {
          status: response.status,
          text: errorText,
          url: url
        });
        throw new Error(`Failed to delete todo: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting todo:', error);
      throw error;
    }
  },
};