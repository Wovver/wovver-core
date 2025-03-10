import { Router, Request, Response, NextFunction } from "express";
import User from "../../models/user";
import jwt from "jsonwebtoken";
import { Sequelize, Op } from "sequelize";
import rateLimit from "express-rate-limit";
import validator from "validator";
import Follow from "../../models/follow";

const router = Router();


const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message:
    "Too many login attempts from this IP, please try again after 15 minutes",
});

const isStrongPassword = (password: string) => {
  return validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  });
};

router.post(
  "/signup",
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { username, email, password } = req.body;
    if (!isStrongPassword(password)) {
      return res.status(400).json({
        error:
          "Password must be at least 8 characters long and include uppercase, lowercase, numbers, and symbols.",
      });
    }

    try {
      const hashedPassword = await User.hashPassword(password);
      const newUser = await User.create({
        username: username.toLowerCase(),
        email,
        password: hashedPassword,
      });

      // Automatically follow "wovver"
      const userToFollow = await User.findOne({ where: { username: 'wovver' } });
      if (userToFollow) {
        await Follow.create({
          followerId: newUser.id,
          followingId: userToFollow.id,
        });
      }

      res
        .status(201)
        .json({ message: "User created successfully", user: newUser });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error creating user" });
    }
  }
);

router.post(
  "/login",
  loginLimiter,
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { username, password } = req.body;  // Only destructure username and password

    try {
      // Find the user based solely on the username
      const user = await User.findOne({
        where: { username },  // Only check for username, no need for email
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Validate the password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid password" });
      }

      // Create JWT token
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
        expiresIn: "1h",
      });

      // Return success message with token
      res.json({ message: "Login successful", token });
    } catch (err) {
      next(err);
    }
  }
);


export default router;
