"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppRouter = void 0;
const express_1 = require("express");
exports.AppRouter = (0, express_1.Router)();
// Example of a route
exports.AppRouter.get('/posts', (req, res) => {
    res.json({ message: 'List of posts' });
});
// Add more routes as needed, e.g.:
exports.AppRouter.post('/posts', (req, res) => {
    const { content } = req.body;
    res.status(201).json({ message: 'Post created', content });
});
