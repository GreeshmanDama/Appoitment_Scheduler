import mongoose, { Schema, Document } from "mongoose";

export interface IAvailability extends Document {
  doctorId: mongoose.Types.ObjectId;
  startAt: Date;
  endAt: Date;
  slotDurationMinutes: number;
  isActive: boolean;
}

const availabilitySchema = new Schema<IAvailability>(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      index: true,
    },

    startAt: {
      type: Date,
      required: true,
    },

    endAt: {
      type: Date,
      required: true,
    },

    slotDurationMinutes: {
      type: Number,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      required: true,
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

availabilitySchema.pre("validate", function () {
  if (
    this.startAt &&
    this.endAt &&
    this.endAt <= this.startAt
  ) {
    this.invalidate(
      "endAt",
      "The end time must be after the start time."
    );
    return;
  }
});

availabilitySchema.index({
  doctorId: 1,
  startAt: 1,
  endAt: 1,
});

export const Availability = mongoose.model<IAvailability>(
  "Availability",
  availabilitySchema
);