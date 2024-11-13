const NOTION_API_KEY = import.meta.env.VITE_NOTION_API_KEY;
const YOUR_PAGE_ID = import.meta.env.VITE_YOUR_PAGE_ID;

const NOTION_API_URL = import.meta.env.PROD 
  ? 'https://doit-tau.vercel.app/api/notion'
  : '/api/notion';

const headers = {
  'Authorization': `Bearer ${NOTION_API_KEY}`,
  'Notion-Version': '2022-06-28',
  'Content-Type': 'application/json',
};

export const notionApi = {
  async fetchTodos() {
    try {
      const response = await fetch(`${NOTION_API_URL}/blocks/${YOUR_PAGE_ID}/children`, {
        method: 'GET',
        headers,
        credentials: 'same-origin',
      });
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

      const headers = {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      };

      export const notionApi = {
        async fetchTodos() {
          try {
            const response = await fetch(`${NOTION_API_URL}/blocks/${YOUR_PAGE_ID}/children`, {
              method: 'GET',
              headers,
              credentials: 'include'
            });

            if (!response.ok) {
              const errorText = await response.text();
              console.error('API Error response:', errorText);
              throw new Error(`Failed to fetch todos: ${response.status}`);
            }

            const data: NotionBlockResponse = await response.json();
            console.log('Fetched data:', data);

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
            const response = await fetch(`${NOTION_API_URL}/blocks/${YOUR_PAGE_ID}/children`, {
              method: 'PATCH',
              headers,
              credentials: 'include',
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
              console.error('API Error response:', errorText);
              throw new Error(`Failed to create todo: ${response.status}`);
            }

            const data = await response.json();
            const newBlock = data.results[0];

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

        async updateTodo(id: string, { text, completed }: { text?: string; completed?: boolean }) {
          try {
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

            const response = await fetch(`${NOTION_API_URL}/blocks/${id}`, {
              method: 'PATCH',
              headers,
              credentials: 'include',
              body: JSON.stringify(updateData),
            });

            if (!response.ok) {
              const errorText = await response.text();
              console.error('API Error response:', errorText);
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
            const response = await fetch(`${NOTION_API_URL}/blocks/${id}`, {
              method: 'DELETE',
              headers,
              credentials: 'include',
            });

            if (!response.ok) {
              const errorText = await response.text();
              console.error('API Error response:', errorText);
              throw new Error(`Failed to delete todo: ${response.status}`);
            }
            return true;
          } catch (error) {
            console.error('Error deleting todo:', error);
            throw error;
          }
        },
      };