
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "./user.model.js";
import { Patient } from "../patient/patient.model.js";
import generateToken from "../../utils/jwtToken.js";

export const register = async (req: Request, res: Response) => {
  try {
    console.log("entered registration..")
    const { name, email, password, phone } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required.",
      });
    }

    const normalizedName = name.trim().replace(/\s+/g, " ");
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedName.length < 3) {
      return res.status(400).json({
        success: false,
        message: "Name must contain at least 3 characters.",
      });
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters.",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      phone,
      passwordHash,
      role: "patient",
      authProvider: "local",
      isVerified: true,
    });

    try {
      await Patient.create({
        userId: user._id,
      });
    } catch (error) {
      await User.deleteOne({ _id: user._id });
      throw error;
    }

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: "Patient registered successfully.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error: any) {
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to register account.",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const expectedRole = req.params.role;

    console.log(expectedRole, email, password)

    if (
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    console.log("finding user")
    
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+passwordHash");
    
    console.log("user found")
    
    if (
      !user ||
      user.authProvider !== "local" ||
      !(await user.comparePassword(password))
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }
    
    console.log("password is correct")
    
    if (
      expectedRole &&
      user.role !== expectedRole
    ) {
      return res.status(403).json({
        success: false,
        message: `You dont have access to this ${expectedRole} portal.`,
      });
    }
    
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your account first.",
      });
    }
    
    const token = generateToken(user._id);
    console.log("token generated")

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to log in.",
    });
  }
};

export const logout = async (_req: Request, res: Response) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return res.status(200).json({
    success: true,
    message: "Logout successful.",
  });
};
