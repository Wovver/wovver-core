import { Request, Response } from 'express';
import User from '../models/user';
import Follow from '../models/follow';
import { AuthError } from '../utils/errors';

// Example function to get user profile
export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    // Ensure req.user is defined
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { username } = req.params;

    const user = await User.findOne({
      where: { username },
      attributes: ['id', 'username', 'displayName', 'bio', 'flags'],
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const isFollowing = await Follow.findOne({
      where: {
        followerId: req.user.userId,
        followingId: user.id,
      },
    });

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
      isFollowing: !!isFollowing,
    });

  } catch (error) {
    console.error('Error fetching user by username:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
}; 