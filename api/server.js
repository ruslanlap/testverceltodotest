const express = require('express');
const { Client } = require('@notionhq/client');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

app.use(cors());
app.use(express.json());

// Get all todos
app.get('/api/notion/blocks/:pageId/children', async (req, res) => {
  try {
    const response = await notion.blocks.children.list({
      block_id: req.params.pageId,
    });
    res.json(response);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create todo
app.patch('/api/notion/blocks/:pageId/children', async (req, res) => {
  try {
    const response = await notion.blocks.children.append({
      block_id: req.params.pageId,
      children: req.body.children,
    });
    res.json({ results: [response] });
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update todo
app.patch('/api/notion/blocks/:blockId', async (req, res) => {
  try {
    const response = await notion.blocks.update({
      block_id: req.params.blockId,
      ...req.body,
    });
    res.json(response);
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete todo
app.delete('/api/notion/blocks/:blockId', async (req, res) => {
  try {
    const response = await notion.blocks.delete({
      block_id: req.params.blockId,
    });
    res.json(response);
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ message: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});