import mongoose from "mongoose";

const partnershipSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    contactPerson: { type: String, required: true },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: true },
    companySize: { type: String, required: true },
    budgetRange: { type: String },
    interestAreas: [{ type: String, required: true }],
    message: { type: String, required: true },
  },
  { timestamps: true }
);

const Partnership = mongoose.model("Partnership", partnershipSchema);

export default Partnership;
