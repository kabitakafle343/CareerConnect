const router = require("express").Router();
const { authorize, allowRoles } = require("../auth/userAuth");
const { getAdminOverview, deleteAdminCompany, deleteAdminJob } = require("../controller/admin");

router.use(authorize, allowRoles("admin"));
router.get("/overview", getAdminOverview);
router.delete("/companies/:id", deleteAdminCompany);
router.delete("/jobs/:id", deleteAdminJob);

module.exports = router;