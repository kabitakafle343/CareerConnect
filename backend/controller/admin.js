const Application = require("../schema/application");
const Company = require("../schema/companySchema");
const Job = require("../schema/job");
const User = require("../schema/userSchema");

exports.getAdminOverview = async (_req, res) => {
	try {
		const [companies, jobs, userCount, applicationCount] = await Promise.all([
			Company.find().populate("owner", "name email").sort({ createdAt: -1 }).lean(),
			Job.find().sort({ createdAt: -1 }).lean(),
			User.countDocuments(),
			Application.countDocuments(),
		]);

		const jobsByCompany = new Map();
		for (const job of jobs) {
			const companyId = String(job.companyId);
			const companyJobs = jobsByCompany.get(companyId) ?? [];
			companyJobs.push(job);
			jobsByCompany.set(companyId, companyJobs);
		}

		return res.json({
			companies: companies.map((company) => ({
				...company,
				jobs: jobsByCompany.get(String(company._id)) ?? [],
			})),
			stats: {
				users: userCount,
				companies: companies.length,
				jobs: jobs.length,
				openJobs: jobs.filter((job) => job.status === "open").length,
				applications: applicationCount,
			},
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

exports.deleteAdminCompany = async (req, res) => {
	try {
		const company = await Company.findById(req.params.id);
		if (!company) return res.status(404).json({ message: "Company not found" });

		const jobs = await Job.find({ companyId: company._id }).select("_id").lean();
		const jobIds = jobs.map((job) => job._id);
		await Promise.all([
			Application.deleteMany({ job: { $in: jobIds } }),
			Job.deleteMany({ companyId: company._id }),
		]);
		await company.deleteOne();

		return res.json({ message: "Company and related jobs deleted" });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

exports.deleteAdminJob = async (req, res) => {
	try {
		const job = await Job.findById(req.params.id);
		if (!job) return res.status(404).json({ message: "Job not found" });

		await Promise.all([
			Application.deleteMany({ job: job._id }),
			job.deleteOne(),
		]);

		return res.json({ message: "Job and related applications deleted" });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};
