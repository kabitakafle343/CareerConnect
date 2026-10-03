const { userLogin, userSignUp, userLogout } = require("../controller/auth");
const { refreshAccessToken } = require("../auth/userAuth");
const upload=require("../middleware/upload")
const router = require("express").Router();

router.post("/login", userLogin);
router.post("/signup", upload.single("profileImage"), userSignUp);
router.post("/refresh", refreshAccessToken);
router.post("/logout", userLogout);
module.exports = router;
