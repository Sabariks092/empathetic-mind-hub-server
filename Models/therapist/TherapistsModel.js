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

// 🔥 Certificate & License schemas
const certificateSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    link: { type: String, default: "" },
  },
  { _id: false }
);

const licenseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    link: { type: String, default: "" },
  },
  { _id: false }
);

const therapistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: "" },
    area: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    country: { type: String, default: "" },

    qualification: { type: String, default: "" },

    // OLD (legacy)
    certifications: { type: [String], default: [] },
    license: { type: String, default: "" },

    // NEW structured objects
    certificates: { type: [certificateSchema], default: [] },
    licenses: { type: [licenseSchema], default: [] },

    specialization: { type: [String], default: [] },
    experience: { type: Number, default: 0 },
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

    // Conditional fields
    onlineDetails: {
      platform: { type: String },
      link: { type: String },
    },
    offlineDetails: {
      clinicName: { type: String },
      clinicAddress: { type: String },
    },

    // 🔥 NEW Location
    location: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
      altitude: { type: Number, default: null },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Therapist", therapistSchema);
