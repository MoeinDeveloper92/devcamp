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

//Include other resource router
const courseRouter = require("./coursesRoutes")

const router = express.Router()

//Re-route into other resource routers
//anythin that has this address, mount it to the courseRoute
router.use("/:bootcampId/courses", courseRouter)
router.route("/:id/photo").put(bootcampFotoUpload)

//api/v1/bootcamps/radius/:zipcode/:distamce
router.route("/radius/:zipcode/:distance").get(getBootcampsInRadius)

//without query params
router.route("/")
    .get(advancedResults(Bootcamp, "courses"), getBootcamps)
    .post(createBootcamp)
//With query params
router.route("/:id")
    .get(getBootcamp)
    .delete(deleteBootcamp)
    .put(updateBootcamp)


module.exports = router