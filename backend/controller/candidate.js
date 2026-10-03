const candidateProfile=require("../schema/candidateSchema");
const Job = require("../schema/job");
const Application = require("../schema/application");

exports.getProfile = async (req, res) => {
  try {
    const profile = await candidateProfile.findOne({
      user: req.user.userId,
    }).populate("user", "name email profileImage phone");

    if (!profile) {
      return res.status(404).json({
        message: "Profile not found",
      });
    }

    res.json({
      profile,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const allowedFields = ["phone", "address", "bio", "skills", "resume", "education", "position"];
    const updates = Object.fromEntries(
      allowedFields.filter((field) => Object.hasOwn(req.body, field)).map((field) => [field, req.body[field]]),
    );
    const profile = await candidateProfile.findOneAndUpdate(
      { user: req.user.userId },
      { $set: updates, $setOnInsert: { user: req.user.userId } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );

    res.json({
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getSavedJobs = async (req, res) => {
  try {
    const profile = await candidateProfile.findOne({ user: req.user.userId })
      .populate({ path: "savedJobs", populate: { path: "companyId", select: "name" } });
    return res.json({ jobs: profile?.savedJobs ?? [] });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.saveJob = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.jobId, status: "open" });
    if (!job) return res.status(404).json({ message: "Open job not found" });
    await candidateProfile.findOneAndUpdate(
      { user: req.user.userId },
      { $setOnInsert: { user: req.user.userId }, $addToSet: { savedJobs: job._id } },
      { upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );
    return res.status(200).json({ message: "Job saved" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.unsaveJob = async (req, res) => {
  try {
    await candidateProfile.updateOne(
      { user: req.user.userId },
      { $pull: { savedJobs: req.params.jobId } },
    );
    return res.status(200).json({ message: "Job removed from saved jobs" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getApplications = async (req, res) => {
  try {
    const applications = await Application.find({ candidate: req.user.userId })
      .populate({ path: "job", populate: { path: "companyId", select: "name" } })
      .sort({ createdAt: -1 });
    return res.json({ applications });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.applyToJob = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.jobId, status: "open" });
    if (!job) return res.status(404).json({ message: "Open job not found" });

    const existingApplication = await Application.findOne({ job: job._id, candidate: req.user.userId });
    if (existingApplication) return res.status(409).json({ message: "You have already applied to this job" });

    const profile = await candidateProfile.findOne({ user: req.user.userId });
    const application = await Application.create({
      job: job._id,
      candidate: req.user.userId,
      resume: req.body.resume || profile?.resume,
      coverLetter: req.body.coverLetter,
    });
    return res.status(201).json({ application });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};