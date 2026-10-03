const { getAllJobs, getJobById, createJob, updateJob, deleteJob, getEmployerDashboard } = require("../controller/job");
const {authorize,allowRoles}=require("../auth/userAuth")
const { getEmployerApplications, updateApplicationStatus } = require("../controller/application");
const route=require("express").Router()
route.get("/", getAllJobs);           
route.get("/dashboard", authorize, allowRoles("employer"), getEmployerDashboard);
route.get("/applications", authorize, allowRoles("employer"), getEmployerApplications);
route.patch("/applications/:applicationId/status", authorize, allowRoles("employer"), updateApplicationStatus);
route.get("/:id", getJobById);           
route.post("/create", authorize, allowRoles("employer"), createJob);
route.put("/:id", authorize, allowRoles("employer"), updateJob);
route.delete("/:id",authorize, allowRoles("employer"), deleteJob);

module.exports=route