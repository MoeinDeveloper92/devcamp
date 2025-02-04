const express = require("express")
const { register, login, getMe } = require("../controllers/auth")
const { protected } = require("../middleware/auth")
const router = express.Router()

router.route("/register").post(register)
router.route("/login").post(login)
router.route("/me").get(protected, getMe)

module.exports = router