import { Router, Request, Response, NextFunction } from "express";
import User from "../models/user";
import jwt from "jsonwebtoken";
import { Sequelize, Op } from "sequelize";

const router = Router();

router.post("/signup", async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await User.hashPassword(password);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating user" });
  }
});

router.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { email, username, password } = req.body;

    try {
      const user = await User.findOne({
        where: {
          [Op.or]: [{ email: email || null }, { username: username || null }],
        },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid password" });
      }

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
        expiresIn: "1h",
      });
      res.json({ message: "Login successful", token });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
