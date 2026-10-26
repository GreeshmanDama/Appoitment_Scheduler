import express, { Request, Response } from "express";
import { login, logout, register } from "./auth.controller.js";
import { protectedRoute } from "../../middleware/auth.middleware.js";

const authRouter = express.Router();

authRouter.get("/me", protectedRoute, (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  return res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    },
  });
});

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/login/:role", (req, res, next) => {
  const { role } = req.params;

  if (role !== "doctor" && role !== "admin") {
    return res.status(400).json({
      success: false,
      message: "Invalid login portal.",
    });
  }

  next();
}, login);

authRouter.post("/logout", logout);

export default authRouter;
