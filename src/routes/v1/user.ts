import { Router, Request, Response, NextFunction } from 'express';
import User from '../../models/user';
import Follow from '../../models/follow';
import jwt from 'jsonwebtoken';
import { AuthError } from '../../utils/errors';
import { CustomRequest, authenticateJWT } from '../../middleware/authMiddleware';
import Post from '../../models/post';
import Like from '../../models/like';
import { formatPost } from './post';

const router = Router();

router.get('/me', authenticateJWT, async (req: CustomRequest, res: Response): Promise<void> => {  // Use 'CustomRequest' here
  try {
    if (!req.user) {
      throw new AuthError('User not authenticated');
    }

    const user = await User.findByPk(req.user.userId); // Use 'req.user.userId' correctly
    if (!user) {
      throw new AuthError('User not found');
    }

    res.json({
      id: user.id,
      username: user.username,
      displayName: user.getDisplayName(),
      email: user.email,
      bio: user.bio,
      flags: user.flags,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(401).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to fetch user profile' });
    }
  }
});

router.get('/:username', authenticateJWT, async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const { username } = req.params;

    const user = await User.findOne({
      where: { username },
      attributes: ['id', 'username', 'displayName', 'bio', 'flags'],
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Check if the authenticated user is following this user
    if (!req.user) {
      throw new AuthError('User not authenticated');
    }
    const isFollowing = await Follow.findOne({
      where: {
        followerId: req.user.userId,
        followingId: user.id,
      },
    });

    // Get counts using Sequelize count method
    const followerCount = await Follow.count({
      where: { followingId: user.id }
    });

    const followingCount = await Follow.count({
      where: { followerId: user.id }
    });

    res.json({
      id: user.id,
      username: user.username,
      displayName: user.getDisplayName(),
      bio: user.bio,
      flags: user.flags,
      followerCount,
      followingCount,
      isFollowing: !!isFollowing, // true if following, false otherwise
    });

  } catch (error) {
    console.error('Error fetching user by username:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update user profile (bio)
router.patch('/me', authenticateJWT, async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthError('User not authenticated');
    }

    const { bio, displayName } = req.body;
    
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      throw new AuthError('User not found');
    }

    await user.update({ 
      bio,
      displayName,
    });

    res.json({
      id: user.id,
      username: user.username,
      displayName: user.getDisplayName(),
      email: user.email,
      bio: user.bio,
      flags: user.flags,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(401).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to update user profile' });
    }
  }
});

// Follow a user
router.post('/:username/follow', authenticateJWT, async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthError('User not authenticated');
    }

    const userToFollow = await User.findOne({ where: { username: req.params.username } });
    if (!userToFollow) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (userToFollow.id === Number(req.user.userId)) {
      res.status(400).json({ error: 'Cannot follow yourself' });
      return;
    }

    await Follow.create({
      followerId: req.user.userId,
      followingId: userToFollow.id,
    });

    res.json({ message: 'Successfully followed user' });
  } catch (error: any) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ error: 'Already following this user' });
    } else {
      res.status(500).json({ error: 'Failed to follow user' });
    }
  }
});

// Unfollow a user
router.delete('/:username/follow', authenticateJWT, async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthError('User not authenticated');
    }

    const userToUnfollow = await User.findOne({ where: { username: req.params.username } });
    if (!userToUnfollow) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const deleted = await Follow.destroy({
      where: {
        followerId: req.user.userId,
        followingId: userToUnfollow.id,
      },
    });

    if (deleted === 0) {
      res.status(400).json({ error: 'Not following this user' });
      return;
    }

    res.json({ message: 'Successfully unfollowed user' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
});

// Get user's followers
router.get('/:username/followers', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findOne({
      where: { username: req.params.username },
      include: [{
        model: User,
        as: 'followers',
        attributes: ['id', 'username', 'flags'],
        through: { attributes: [] },
      }],
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user.followers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch followers' });
  }
});

// Get users that a user is following
router.get('/:username/following', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findOne({
      where: { username: req.params.username },
      include: [{
        model: User,
        as: 'following',
        attributes: ['id', 'username', 'flags'],
        through: { attributes: [] },
      }],
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user.following);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch following' });
  }
});

// In the user's posts route, use the formatPost from post.ts
router.get('/:username/posts', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findOne({
      where: { username: req.params.username },
      attributes: ['id'],
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const posts = await Post.findAll({
      where: { userId: user.id },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'displayName'],
        },
        {
          model: Like,
          attributes: ['userId'],
        },
        {
          model: Post,
          as: 'parentPost',
          include: [{
            model: User,
            attributes: ['id', 'username', 'displayName'],
          }],
        }
      ]
    });

    const formattedPosts = await Promise.all(posts.map(formatPost));
    res.json(formattedPosts);

  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ error: 'Failed to fetch user posts' });
  }
});

// Add a new route to get replies to a user's post
router.get('/:username/posts/:postId/replies', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, postId } = req.params;

    const user = await User.findOne({ where: { username } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const post = await Post.findOne({ 
      where: { 
        id: postId,
        userId: user.id 
      } 
    });
    
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    const replies = await Post.findAll({
      where: { replyTo: post.id },
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
    console.error('Error fetching post replies:', error);
    res.status(500).json({ error: 'Failed to fetch replies' });
  }
});

// Add this new route to get user's liked posts
router.get('/:username/liked-posts', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findOne({
      where: { username: req.params.username },
      attributes: ['id'],
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const likedPosts = await Post.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'displayName'],
        },
        {
          model: Like,
          where: { userId: user.id },
          attributes: ['userId'],
        }
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json(likedPosts.map(post => ({
      id: post.id,
      content: post.content,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: post.User ? {
        id: post.User.id,
        username: post.User.username,
        displayName: post.User.getDisplayName(),
      } : null,
      likeCount: post.Likes?.length || 0,
    })));

  } catch (error) {
    console.error('Error fetching liked posts:', error);
    res.status(500).json({ error: 'Failed to fetch liked posts' });
  }
});

export default router;
