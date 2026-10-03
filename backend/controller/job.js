const Job = require("../schema/job");
const Company=require("../schema/companySchema")
const Application = require("../schema/application");
exports.createJob = async (req, res) => {
  try {
    const company = await Company.findOne({ owner: req.user.userId });
    if (!company) return res.status(404).json({ message: "Company profile not found" });

    const job = await Job.create({ ...req.body, companyId: company._id });
    return res.status(201).json({ message: "Job posted successfully", job });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: "open" }).populate("companyId", "name");
    return res.status(200).json({ message: "Jobs fetched", jobs });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getEmployerDashboard = async (req, res) => {
  try {
    const company = await Company.findOne({ owner: req.user.userId });
    if (!company) {
      return res.status(404).json({ message: "Company profile not found" });
    }

    const jobs = await Job.find({ companyId: company._id }).sort({ createdAt: -1 });
    const jobIds = jobs.map((job) => job._id);
    const totalApplicants = await Application.countDocuments({ job: { $in: jobIds } });
    const hired = await Application.countDocuments({ job: { $in: jobIds }, status: "hired" });
    const applicantCounts = await Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      { $group: { _id: "$job", count: { $sum: 1 } } },
    ]);
    const applicantCountsByJob = new Map(applicantCounts.map(({ _id, count }) => [String(_id), count]));
    const jobsWithApplicantCounts = jobs.map((job) => ({
      ...job.toObject(),
      applicantCount: applicantCountsByJob.get(String(job._id)) ?? 0,
    }));

    return res.status(200).json({
      company,
      jobs: jobsWithApplicantCounts,
      stats: {
        activeJobs: jobs.filter((job) => job.status === "open").length,
        totalApplicants,
        hired,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("companyId", "name");
    if (!job) return res.status(404).json({ message: "Job not found" });
    return res.status(200).json({ message: "Job fetched", job });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!job) return res.status(404).json({ message: "Job not found" });
    return res.status(200).json({ message: "Job updated", job });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    return res.status(200).json({ message: "Job deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};