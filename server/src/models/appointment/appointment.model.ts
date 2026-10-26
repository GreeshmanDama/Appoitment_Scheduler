import mongoose, { Schema, Document } from "mongoose";

export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "no_show";

export interface IAppointment extends Document {
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  availabilityId: mongoose.Types.ObjectId;
  appointmentTime: Date;
  status: AppointmentStatus;
  reason?: string;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },

    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      index: true,
    },

    availabilityId: {
      type: Schema.Types.ObjectId,
      ref: "Availability",
      required: true,
      index: true,
    },

    appointmentTime: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "scheduled",
        "confirmed",
        "cancelled",
        "completed",
        "no_show",
      ],
      default: "scheduled",
      required: true,
    },

    reason: {
      type: String,
      trim: true,
      maxlength: 1000,
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

appointmentSchema.index({
  doctorId: 1,
  appointmentTime: 1,
});

appointmentSchema.index({
  patientId: 1,
  appointmentTime: -1,
});

export const Appointment = mongoose.model<IAppointment>(
  "Appointment",
  appointmentSchema
);