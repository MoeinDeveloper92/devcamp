const express = require("express")
const { register, login, getMe, forgotPassword, resetPassword, updateDetails, updatePassword } = require("../controllers/auth")
const { protected } = require("../middleware/auth")
const router = express.Router()

router.route("/register").post(register)
router.route("/login").post(login)
router.route("/me").get(protected, getMe)
router.route("/forgotpassword").post(forgotPassword)
router.route("/resetpassword/:resetToken").put(resetPassword)
router.route("/updatedetails").put(protected, updateDetails)
router.route("/updatepassword").put(protected, updatePassword)

module.exports = router