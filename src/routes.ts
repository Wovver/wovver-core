import { Router } from 'express';

export const AppRouter = Router();

// Example of a route
AppRouter.get('/posts', (req, res) => {
  res.json({ message: 'List of posts' });
});

// Add more routes as needed, e.g.:
AppRouter.post('/posts', (req, res) => {
  const { content } = req.body;
  res.status(201).json({ message: 'Post created', content });
});
