const Company = require("../schema/companySchema");
exports.createComoany = async (req, res) => {
  try {
    const { name, description, location, website } = req.body;
    const owner = req.user.userId;
    const newCompany = await Company.create({
      name,
      description,
      location,
      website,
      owner,
    });
    return res.status(201).json({
      message: "New company created successfully",
      company: newCompany,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: "company not found" });
    }
    return res
      .status(200)
      .json({ message: "company get successfully", company });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateCompany = async (req, res) => {
  try {
    const { name, description, location, website } = req.body;
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: "company not found" });
    }
    if (company.owner.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "you are not authorized to update this company" });
    }
    const updatedcompany = await Company.findByIdAndUpdate(
      req.params.id,
      { name, description, location, website },
      { new: true },
    );
    return res
      .status(200)
      .json({
        message: "company updated successfully",
        company: updatedcompany,
      });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};


exports.getMyCompany = async (req, res) => {
  try {
    const company = await Company.findOne({ owner: req.user.userId });
    if (!company) return res.status(404).json({ message: "Company profile not found" });
    return res.status(200).json({ message: "Company fetched", company });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};