const express = require("express")
const {
    getBootcamps,
    getBootcamp,
    createBootcamp,
    updateBootcamp,
    deleteBootcamp,
    getBootcampsInRadius,
    bootcampFotoUpload
} = require("../controllers/bootcampsController")

const advancedResults = require("../middleware/advancedResult")
const Bootcamp = require("../models/Bootcamp")
const { protected, roleGuard } = require("../middleware/auth")
//Include other resource router
const courseRouter = require("./coursesRoutes")

const router = express.Router()

//Re-route into other resource routers
//anythin that has this address, mount it to the courseRoute
router.use("/:bootcampId/courses", courseRouter)
router.route("/:id/photo").put(protected, roleGuard("publisher", "admin"), bootcampFotoUpload)

//api/v1/bootcamps/radius/:zipcode/:distamce
router.route("/radius/:zipcode/:distance").get(getBootcampsInRadius)

//without query params
router.route("/")
    .get(advancedResults(Bootcamp, "courses"), getBootcamps)
    .post(protected, roleGuard("publisher", "admin"), createBootcamp)
//With query params
router.route("/:id")
    .get(getBootcamp)
    .delete(protected, roleGuard("publisher", "admin"), deleteBootcamp)
    .put(protected, roleGuard("publisher", "admin"), updateBootcamp)


module.exports = router