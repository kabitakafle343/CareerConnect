const router=require("express").Router();
const {createComoany,getCompanyById,updateCompany, getMyCompany}=require("../controller/company")
const {authorize,allowRoles}=require("../auth/userAuth")
router.post("/create",authorize,allowRoles("employer"),createComoany)
router.get("/:id",authorize,getCompanyById)
router.get("/",authorize,allowRoles("employer"),getMyCompany)
router.put("/:id",authorize,allowRoles("employer"),updateCompany)

module.exports=router