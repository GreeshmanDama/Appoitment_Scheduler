import type { Request, Response } from "express";
import bcrypt from "bcryptjs";

import { User } from "../auth/user.model.js";
import { Doctor } from "../doctor/doctor.model.js";
import { Appointment } from "../appointment/appointment.model.js";
import { Patient } from "../patient/patient.model.js";

export const createDoctor = async (req: Request, res: Response) => {
  let createdUserId: unknown;

  try {
    const {
      name,
      email,
      password,
      phone,
      doctorCode,
      specialization,
      qualification,
      experienceYears,
    } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof doctorCode !== "string" ||
      typeof specialization !== "string" ||
      typeof qualification !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, password, doctor code, specialization and qualification are required.",
      });
    }

    const normalizedName = name.trim().replace(/\s+/g, " ");
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedDoctorCode = doctorCode.trim().toUpperCase();
    const normalizedSpecialization = specialization.trim();
    const normalizedQualification = qualification.trim();

    if (normalizedName.length < 3 || normalizedName.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Name must contain 3–50 characters.",
      });
    }

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address.",
      });
    }

    if (
      password.length < 8 ||
      password.length > 72 ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least 8 characters and at most 72 UTF-8 bytes.",
      });
    }

    if (
      normalizedDoctorCode.length < 3 ||
      normalizedDoctorCode.length > 40 ||
      !/^[A-Z0-9]+(?:-[A-Z0-9]+)*$/.test(normalizedDoctorCode)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Doctor code must be 3–40 characters and contain only letters, numbers and single hyphens, e.g. DOC-1001.",
      });
    }

    if (
      normalizedSpecialization.length < 2 ||
      normalizedSpecialization.length > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Specialization must contain 2–100 characters.",
      });
    }

    if (
      normalizedQualification.length < 2 ||
      normalizedQualification.length > 200
    ) {
      return res.status(400).json({
        success: false,
        message: "Qualification must contain 2–200 characters.",
      });
    }

    if (
      typeof experienceYears !== "number" ||
      !Number.isInteger(experienceYears) ||
      experienceYears < 0 ||
      experienceYears > 60
    ) {
      return res.status(400).json({
        success: false,
        message: "Experience must be an integer between 0 and 60.",
      });
    }

    if (
      phone !== undefined &&
      phone !== null &&
      (typeof phone !== "string" ||
        phone.trim().length === 0 ||
        phone.trim().length > 20)
    ) {
      return res.status(400).json({
        success: false,
        message: "Phone must contain 1–20 characters when provided.",
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

    const existingDoctor = await Doctor.findOne({
      doctorCode: normalizedDoctorCode,
    });

    if (existingDoctor) {
      return res.status(409).json({
        success: false,
        message: "This doctor code is already assigned. Choose another code.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      phone:
        typeof phone === "string" && phone.trim() ? phone.trim() : undefined,
      passwordHash,
      role: "doctor",
      authProvider: "local",
      isVerified: true,
    });

    createdUserId = user._id;

    const doctor = await Doctor.create({
      userId: user._id,
      doctorCode: normalizedDoctorCode,
      specialization: normalizedSpecialization,
      qualification: normalizedQualification,
      experienceYears,
    });

    return res.status(201).json({
      success: true,
      message: "Doctor created successfully.",
      doctor: {
        id: doctor._id,
        doctorCode: doctor.doctorCode,
        name: user.name,
        email: user.email,
        phone: user.phone,
        specialization: doctor.specialization,
        qualification: doctor.qualification,
        experienceYears: doctor.experienceYears,
      },
    });
  } catch (error: unknown) {
    if (createdUserId) {
      try {
        await User.deleteOne({ _id: createdUserId });
      } catch (rollbackError) {
        console.error("Doctor creation rollback failed:", rollbackError);
      }
    }

    const mongoError = error as {
      code?: number;
      keyPattern?: Record<string, unknown>;
    };

    if (mongoError.code === 11000) {
      const duplicateField = Object.keys(mongoError.keyPattern ?? {})[0];

      return res.status(409).json({
        success: false,
        message:
          duplicateField === "doctorCode"
            ? "This doctor code is already assigned."
            : duplicateField === "email"
              ? "An account with this email already exists."
              : "A record with these details already exists.",
      });
    }

    console.error("Doctor creation error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create doctor account.",
    });
  }
};

export const updateDoctor = async (req: Request, res: Response) => {};

export const dashboardStats = async (req: Request, res: Response) => {};

export const getDoctors = async (req: Request, res: Response) => {};

export const getAppointments = async (req: Request, res: Response) => {};
