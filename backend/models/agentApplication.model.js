import mongoose from "mongoose";
const { Schema } = mongoose;

const agentApplicationSchema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // 1. Personal Details
    firstName:      { type: String, required: true, trim: true },
    lastName:       { type: String, required: true, trim: true },
    dateOfBirth:    { type: String, required: true },
    gender:         { type: String, enum: ["Male", "Female", "Other"], required: true },

    // 2. Contact Details
    email:    { type: String, required: true, lowercase: true, trim: true },
    phone:    { type: String, required: true, match: [/^\d{10}$/, "10 digits required"] },
    address:  { type: String, required: true, trim: true },
    city:     { type: String, required: true, trim: true },
    state:    { type: String, required: true, trim: true },
    pincode:  { type: String, required: true, match: [/^\d{6}$/, "6 digits required"] },

    // 3. Identity Verification
    aadharNumber: { type: String, required: true, match: [/^\d{12}$/, "12 digits required"] },
    idProofUrl:   { type: String, required: true },

    // 4. Driving Information
    drivingLicenseNumber: { type: String, required: true, trim: true },
    licenseExpiryDate:    { type: String, required: true },
    drivingLicenseUrl:    { type: String, required: true },

    // 5. Work Experience
    currentJob:            { type: String, trim: true },
    previousJob:           { type: String, trim: true },
    yearsOfExperience:     { type: String, required: true },
    hasCarSalesExperience: { type: Boolean, default: false },

    // 6. Automobile Knowledge
    carKnowledge:               { type: String, required: true },
    vehicleTransactionExperience: { type: String },

    // 7. Work Location
    preferredWorkingCity: { type: String, required: true, trim: true },
    willingToTravel:      { type: Boolean, default: false },

    // 8. Availability
    employmentType:       { type: String, enum: ["Full-time", "Part-time"], required: true },
    availableWorkingDays: { type: String, required: true },

    // 9. Skills
    languagesKnown:             { type: String, required: true },
    customerHandlingExperience: { type: String },
    salesExperience:            { type: String },

    // 10. References
    referenceName:  { type: String, trim: true },
    referencePhone: { type: String },

    // 11. Motivation
    motivation: { type: String, required: true },

    // 12. Documents
    resumeUrl:       { type: String, required: true },
    addressProofUrl: { type: String, required: true },

    // Status & admin fields
    status:      { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    adminMessage:{ type: String },
    agentEmail:  { type: String, lowercase: true, trim: true },
  },
  { timestamps: true }
);

agentApplicationSchema.index({ status: 1 });
agentApplicationSchema.index({ userId: 1 });
agentApplicationSchema.index({ email: 1 });
agentApplicationSchema.index({ firstName: "text", lastName: "text", email: "text", agentEmail: "text" });

const AgentApplication = mongoose.model("AgentApplication", agentApplicationSchema);
export default AgentApplication;
