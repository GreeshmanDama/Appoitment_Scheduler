import mongoose, { Schema, Document } from "mongoose";

export type Gender =
  | "male"
  | "female"
  | "other"
  | "prefer_not_to_say";

export interface IPatient extends Document {
  userId: mongoose.Types.ObjectId;
  dateOfBirth?: Date;
  gender?: Gender;
  address?: string;
}

const patientSchema = new Schema<IPatient>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    dateOfBirth: {
      type: Date,
      validate: {
        validator: (value: Date) =>
          !value || value <= new Date(),
        message: "Date of birth cannot be in the future.",
      },
    },

    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say"],
    },

    address: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    versionKey: false,
  }
);

export const Patient = mongoose.model<IPatient>(
  "Patient",
  patientSchema
);