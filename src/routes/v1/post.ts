import express, { Request, Response, Router } from "express";
import { body, validationResult } from "express-validator";
import Post from "../../models/post";
import Like from "../../models/like";
import { authenticateJWT, CustomRequest } from "../../middleware/authMiddleware";
import User from "../../models/user";

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
  };
}

const router: Router = express.Router();

// Helper function to get parent posts recursively
const getParentChain = async (post: Post): Promise<any[]> => {
  if (!post.replyTo) return [];
  
  const parent = await Post.findOne({
    where: { id: post.replyTo },
    include: [
      {
        model: User,
        attributes: ['id', 'username', 'displayName'],
      },
      {
        model: Like,
        attributes: ['userId'],
      }
    ]
  });

  if (!parent) return [];

  const parentChain = await getParentChain(parent);
  return [
    {
      id: parent.id,
      content: parent.content,
      createdAt: parent.createdAt,
      updatedAt: parent.updatedAt,
      author: parent.User ? {
        id: parent.User.id,
        username: parent.User.username,
        displayName: parent.User.getDisplayName(),
      } : null,
      likeCount: parent.Likes?.length || 0,
    },
    ...parentChain
  ];
};

// Update the formatPost function to include parent chain
export const formatPost = async (post: Post) => ({
  id: post.id,
  content: post.content,
  createdAt: post.createdAt,
  updatedAt: post.updatedAt,
  replyTo: post.replyTo,
  author: post.User ? {
    id: post.User.id,
    username: post.User.username,
    displayName: post.User.getDisplayName(),
  } : null,
  likeCount: post.Likes?.length || 0,
  replyCount: await Post.count({ where: { replyTo: post.id } }),
  isReply: post.replyTo !== null,
  parentChain: await getParentChain(post), // This will contain all parent posts in order
});

// Create a new post or reply
router.post('/', authenticateJWT, async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const { content, replyTo } = req.body;
    
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (replyTo) {
      const parentPost = await Post.findByPk(replyTo);
      if (!parentPost) {
        res.status(404).json({ error: 'Parent post not found' });
        return;
      }
    }

    const post = await Post.create({
      content,
      userId: req.user.userId,
      replyTo: replyTo || null,
    });

    const newPost = await Post.findByPk(post.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'displayName'],
        },
        {
          model: Post,
          as: 'parentPost',
          include: [{
            model: User,
            attributes: ['id', 'username', 'displayName'],
          }],
        }
      ],
    });

    res.json(await formatPost(newPost!));
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Get replies to a post
router.get('/:postId/replies', async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;

    const post = await Post.findByPk(postId);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    const replies = await Post.findAll({
      where: { replyTo: postId },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'displayName'],
        },
        {
          model: Like,
          attributes: ['userId'],
        }
      ]
    });

    const formattedReplies = await Promise.all(replies.map(formatPost));
    res.json(formattedReplies);

  } catch (error) {
    console.error('Error fetching replies:', error);
    res.status(500).json({ error: 'Failed to fetch replies' });
  }
});

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

// Add this new route to get a post with its context
router.get('/:postId/thread', async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;

    // Get the main post
    const mainPost = await Post.findOne({
      where: { id: postId },
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'displayName'],
        },
        {
          model: Like,
          attributes: ['userId'],
        }
      ]
    });

    if (!mainPost) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    // Get replies to this post
    const replies = await Post.findAll({
      where: { replyTo: postId },
      order: [['createdAt', 'ASC']],
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'displayName'],
        },
        {
          model: Like,
          attributes: ['userId'],
        }
      ]
    });

    // Format everything
    const formattedMainPost = await formatPost(mainPost);
    const formattedReplies = await Promise.all(replies.map(formatPost));

    res.json({
      post: formattedMainPost,
      parentChain: formattedMainPost.parentChain,
      replies: formattedReplies
    });

  } catch (error) {
    console.error('Error fetching post thread:', error);
    res.status(500).json({ error: 'Failed to fetch post thread' });
  }
});

export default router;
