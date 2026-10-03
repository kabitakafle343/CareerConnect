const mongoose = require("mongoose");
const Application = require("../schema/application");
const CandidateProfile = require("../schema/candidateSchema");
const Company = require("../schema/companySchema");
const Job = require("../schema/job");

const applicationStatuses = ["pending", "reviewing", "shortlisted", "rejected", "hired"];

exports.getEmployerApplications = async (req, res) => {
	try {
		const company = await Company.findOne({ owner: req.user.userId });
		if (!company) return res.status(404).json({ message: "Company profile not found" });

		const jobs = await Job.find({ companyId: company._id }).select("_id");
		const applications = await Application.find({ job: { $in: jobs.map((job) => job._id) } })
			.populate("candidate", "name email profileImage")
			.populate("job", "title location")
			.sort({ createdAt: -1 });
		const candidateIds = applications.map((application) => application.candidate?._id).filter(Boolean);
		const profiles = await CandidateProfile.find({ user: { $in: candidateIds } })
			.select("user phone address bio skills resume");
		const profilesByUserId = new Map(profiles.map((profile) => [String(profile.user), profile]));

		return res.json({
			applications: applications.map((application) => ({
				...application.toObject(),
				candidateProfile: profilesByUserId.get(String(application.candidate?._id)) ?? null,
			})),
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

exports.updateApplicationStatus = async (req, res) => {
	try {
		if (!mongoose.isValidObjectId(req.params.applicationId)) {
			return res.status(400).json({ message: "Invalid application ID" });
		}
		if (!applicationStatuses.includes(req.body.status)) {
			return res.status(400).json({ message: "Invalid application status" });
		}

		const company = await Company.findOne({ owner: req.user.userId });
		if (!company) return res.status(404).json({ message: "Company profile not found" });
		const jobs = await Job.find({ companyId: company._id }).select("_id");
		const application = await Application.findOneAndUpdate(
			{ _id: req.params.applicationId, job: { $in: jobs.map((job) => job._id) } },
			{ $set: { status: req.body.status } },
			{ new: true, runValidators: true },
		)
			.populate("candidate", "name email profileImage")
			.populate("job", "title location");

		if (!application) return res.status(404).json({ message: "Application not found" });
		return res.json({ application });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};
