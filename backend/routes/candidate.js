const router = require("express").Router();
const { authorize, allowRoles } = require("../auth/userAuth");
const {
  applyToJob,
  getApplications,
  getProfile,
  getSavedJobs,
  saveJob,
  unsaveJob,
  updateProfile,
} = require("../controller/candidate");

router.use(authorize, allowRoles("candidate"));
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.get("/applications", getApplications);
router.post("/jobs/:jobId/applications", applyToJob);
router.get("/saved-jobs", getSavedJobs);
router.post("/saved-jobs/:jobId", saveJob);
router.delete("/saved-jobs/:jobId", unsaveJob);

module.exports = router;