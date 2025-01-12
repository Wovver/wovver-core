import express, { Request, Response, Router } from "express";
import { body, validationResult } from "express-validator";
import Post from "../../models/post";
import Like from "../../models/like";
import { authenticateJWT } from "../../middleware/authMiddleware";
import User from "../../models/user";

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
  };
}

const router: Router = express.Router();

router.post(
  "/create",
  authenticateJWT,
  body("content").isLength({ min: 1 }).withMessage("Content cannot be empty"),
  async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { content } = req.body;
      if (!req.user) {
        return res.status(401).json({ message: "User is not authenticated" });
      }

      const userId = req.user.userId;

      const newPost = await Post.create({
        content,
        userId,
      });

      return res.status(201).json(newPost);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Error creating post" });
    }
  }
);

router.post(
  "/like",
  authenticateJWT,
  body("postId").isInt().withMessage("Post ID must be an integer"),
  async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { postId } = req.body;
      if (!req.user) {
        return res.status(401).json({ message: "User is not authenticated" });
      }

      const userId = req.user.userId;

      const post = await Post.findByPk(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      const existingLike = await Like.findOne({
        where: {
          post_id: postId,
          user_id: userId,
        },
      });
      if (existingLike) {
        return res
          .status(400)
          .json({ message: "User already liked this post" });
      }

      const like = await Like.create({
        post_id: postId,
        user_id: userId,
      });

      return res.status(201).json(like);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Error liking post" });
    }
  }
);

router.post(
  "/unlike",
  authenticateJWT,
  body("postId").isInt().withMessage("Post ID must be an integer"),
  async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { postId } = req.body;
      if (!req.user) {
        return res.status(401).json({ message: "User is not authenticated" });
      }

      const userId = req.user.userId;

      const post = await Post.findByPk(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      const existingLike = await Like.findOne({
        where: {
          post_id: postId,
          user_id: userId,
        },
      });

      if (!existingLike) {
        return res
          .status(400)
          .json({ message: "User has not liked this post" });
      }

      await existingLike.destroy();

      return res.status(200).json({ message: "Post unliked successfully" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Error unliking post" });
    }
  }
);

router.get(
  "/:postId",
  async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    const { postId } = req.params;
    try {
      const post = await Post.findOne({ where: { id: postId } });
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      const likes = await Like.findAll({
        where: { post_id: postId },
        include: { model: User, attributes: ["id", "username"] },
      });

      return res.json({ post, likes });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Error retrieving post" });
    }
  }
);

export default router;
