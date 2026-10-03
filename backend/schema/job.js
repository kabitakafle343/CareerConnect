const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    requiredSkills: [{ type: String }],
    location: { type: String, required: true },
    jobType: { type: String, enum: ["full-time", "part-time", "remote", "internship"], required: true },
    salaryMin: { type: Number },
    salaryMax: { type: Number },
    deadline: { type: Date },
    status: { type: String, enum: ["open", "closed"], default: "open" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);