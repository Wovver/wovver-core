import express, { Request, Response, Router } from 'express';
import { body, validationResult } from 'express-validator';
import Post from '../../models/post';
import { authenticateJWT } from '../../middleware/authMiddleware'; // Import the middleware

// Extend the Request interface to include the user property
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
  };
}

const router: Router = express.Router();

// Create a post
router.post(
  '/create',
  authenticateJWT, // Apply the JWT authentication middleware here
  body('content').isLength({ min: 1 }).withMessage('Content cannot be empty'),
  async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { content } = req.body;
      if (!req.user) {
        return res.status(401).json({ message: 'User is not authenticated' });
      }
      
      const userId = req.user.userId; // Extract user ID from the decoded JWT token

      const newPost = await Post.create({
        content,
        userId,
      });

      return res.status(201).json(newPost);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error creating post' });
    }
  }
);

export default router;
