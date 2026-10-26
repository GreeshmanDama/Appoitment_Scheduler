import { Request, Response } from "express";
import { Doctor } from "./doctor.model.js";
import bcrypt from "bcryptjs";
import { User } from "../auth/user.model.js";
import generateToken from "../../utils/jwtToken.js";

export const createDoctor = async (req: Request, res: Response) => {
  try {
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

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
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

    const existingUser = await Doctor.findOne({
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
      role: "doctor",
      authProvider: "local",
      isVerified: true,
    });

    try {
      await Doctor.create({
        userId: user._id,
      });
    } catch (error) {
      await User.deleteOne({ _id: user._id });
      throw error;
    }

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: "Doctor registered successfully.",
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
