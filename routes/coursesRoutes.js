const express = require("express")
const { getCourses, getCourse, createCourse, updateCourse, deleteCourse } = require("../controllers/coursesController")
const { protected, roleGuard } = require("../middleware/auth")
const router = express.Router({ mergeParams: true })
const Course = require("../models/Course")
const advancedResults = require("../middleware/advancedResult")



router.route("/")
    .get(advancedResults(Course, { path: "bootcamp", select: "name description" }), getCourses)
    .post(protected, roleGuard("publisher", "admin"), createCourse)
router.route("/:id")
    .get(getCourse)
    .put(protected, roleGuard("publisher", "admin"), updateCourse)
    .delete(protected, roleGuard("publisher", "admin"), deleteCourse)

module.exports = router