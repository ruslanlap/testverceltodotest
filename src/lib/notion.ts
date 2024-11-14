const NOTION_API_KEY = import.meta.env.VITE_NOTION_API_KEY;

const YOUR_PAGE_ID = import.meta.env.VITE_YOUR_PAGE_ID;

const NOTION_API_URL = 'https://doit-one-iota.vercel.app/api/notion';

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

  'Access-Control-Allow-Origin': '*',

};

export const notionApi = {

  async fetchTodos() {

    try {

      const response = await fetch(`${NOTION_API_URL}/blocks/${YOUR_PAGE_ID}/children`, {

        method: 'GET',

        headers,

        mode: 'cors'

      });

      if (!response.ok) {

        const errorData = await response.json();

        throw new Error(errorData.message || 'Failed to fetch todos');

      }

      const data: NotionBlockResponse = await response.json();

      console.log('Fetched data:', data);

      return data.results

        .filter(block => block.type === 'to_do')

        .map(block => ({

          id: block.id,

          text: block.to_do.rich_text[0]?.text?.content || '',

          completed: block.to_do.checked || false,

          createdAt: new Date(block.created_time).getTime(),

        }));

    } catch (error) {

      console.error('Error fetching todos:', error);

      throw error;

    }

  },

  async createTodo(text: string) {

    try {

      const response = await fetch(`${NOTION_API_URL}/blocks/${YOUR_PAGE_ID}/children`, {

        method: 'PATCH',

        headers,

        mode: 'cors',

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

        const errorData = await response.json();

        throw new Error(errorData.message || 'Failed to create todo');

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

        mode: 'cors',

        body: JSON.stringify(updateData),

      });

      if (!response.ok) {

        const errorData = await response.json();

        throw new Error(errorData.message || 'Failed to update todo');

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

        mode: 'cors',

      });

      if (!response.ok) {

        const errorData = await response.json();

        throw new Error(errorData.message || 'Failed to delete todo');

      }

      return true;

    } catch (error) {

      console.error('Error deleting todo:', error);

      throw error;

    }

  },

};