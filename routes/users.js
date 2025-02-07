const express = require("express")
const {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
} = require("../controllers/usersController")
const { protected, roleGuard } = require("../middleware/auth")
const advancedResults = require("../middleware/advancedResult")
const User = require("../models/User")
const router = express.Router()


//By adding this one line below, we specify that any thing below this is protected!
router.use(protected)
router.use(roleGuard("admin"))


router.route("/")
    .get(advancedResults(User), getUsers)
    .post(createUser)
router.route("/:id")
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser)



module.exports = router