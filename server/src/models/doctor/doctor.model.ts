import mongoose, { Schema, Document } from "mongoose";

export interface IDoctor extends Document {
  userId: mongoose.Types.ObjectId;
  doctorCode: string,
  specialization: string;
  qualification: string;
  experienceYears: number;
}

const doctorSchema = new Schema<IDoctor>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    doctorCode: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      trim: true,
      uppercase: true,
    },

    specialization: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    qualification: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    experienceYears: {
      type: Number,
      required: true,
      min: 0,
      max: 60,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    versionKey: false,
  },
);

export const Doctor = mongoose.model<IDoctor>("Doctor", doctorSchema);
