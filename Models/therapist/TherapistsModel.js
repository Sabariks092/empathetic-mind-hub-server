import mongoose from "mongoose";

const updateRequestSchema = new mongoose.Schema(
  {
    field: { type: String, required: true },
    oldValue: { type: mongoose.Schema.Types.Mixed },
    newValue: { type: mongoose.Schema.Types.Mixed },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    requestedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date },
  },
  { _id: true }
);

const therapistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    area: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    country: { type: String, default: "" },

    qualification: { type: String, required: true },

    certifications: { type: [String], default: [] },
    specialization: { type: [String], default: [] },

    experience: { type: Number, default: 0 },
    license: { type: String, required: true },
    profileLink: { type: String, default: "" },

    description: { type: String, default: "" },
    profileImage: { type: String, default: "" },
    charges: { type: String, default: "" },
    availabilityType: { type: String, default: "" },
    availabilitySlots: { type: [String], default: [] },
    serviceDescription: { type: String, default: "" },

    isApproved: { type: Boolean, default: false },

    // 🔥 NEW: Array of update requests
    updateRequests: [updateRequestSchema],

    consultationMode: {
      type: String,
      enum: ["Online", "Offline", "Both"],
    },

    // 🔥 Conditional fields
    onlineDetails: {
      platform: { type: String }, // e.g. Zoom, Google Meet
      link: { type: String }, // meeting link
    },
    offlineDetails: {
      clinicName: { type: String },
      clinicAddress: { type: String },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Therapist", therapistSchema);
