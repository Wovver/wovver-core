import { Router, Response } from 'express';
import { CustomRequest, authenticateJWT } from '../../middleware/authMiddleware';
import User from '../../models/user';
import { AuthError } from '../../utils/errors';
import bcrypt from 'bcrypt';

const router = Router();

// Get current user settings
router.get('/', authenticateJWT, async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthError('Not authenticated');
    }

    const user = await User.findByPk(req.user.userId);
    if (!user) {
      throw new AuthError('User not found');
    }

    res.json({
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      bio: user.bio,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(401).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  }
});

// Update profile settings
router.patch('/profile', authenticateJWT, async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthError('Not authenticated');
    }

    const { username, displayName, bio } = req.body;
    
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      throw new AuthError('User not found');
    }

    // Check if username is taken if it's being changed
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        res.status(400).json({ error: 'Username already taken' });
        return;
      }
    }

    await user.update({
      username: username || user.username,
      displayName: displayName || user.displayName,
      bio: bio || user.bio,
    });

    res.json({
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(401).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
});

// Update email
router.patch('/email', authenticateJWT, async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthError('Not authenticated');
    }

    const { email, password } = req.body;
    
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      throw new AuthError('User not found');
    }

    // Verify current password
    const validPassword = await user.comparePassword(password);
    if (!validPassword) {
      res.status(400).json({ error: 'Invalid password' });
      return;
    }

    // Check if email is taken
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'Email already in use' });
      return;
    }

    await user.update({ email });

    res.json({ message: 'Email updated successfully' });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(401).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to update email' });
    }
  }
});

// Update password
router.patch('/password', authenticateJWT, async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthError('Not authenticated');
    }

    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      throw new AuthError('User not found');
    }

    // Verify current password
    const validPassword = await user.comparePassword(currentPassword);
    if (!validPassword) {
      res.status(400).json({ error: 'Invalid current password' });
      return;
    }

    // Hash new password
    const hashedPassword = await User.hashPassword(newPassword);
    await user.update({ password: hashedPassword });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(401).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to update password' });
    }
  }
});

export default router; 