const ErrorResponse = require("../utils/errorResponse")
const asyncHandler = require("../middleware/async")
const Course = require("../models/Course")
const Bootcamp = require("../models/Bootcamp")

//@desc     Get Courses
//@route    GET /api/v1/courses
//@route    GET /api/v1/bootcamps/:bootcampId/courses
//@access Public
exports.getCourses = asyncHandler(async (req, res, next) => {

    if (req.params.bootcampId) {
        const courses = await Course.find({ bootcamp: req.params.bootcampId })
        return res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        })
    } else {
        res.status(200).json(res.advancedResults)
    }

})



//@desc     Get a Single Course
//@route    GET /api/v1/courses/:id
//@access Public
exports.getCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id).populate({
        path: "bootcamp",
        select: "name description"
    })

    if (!course) {
        return next(new ErrorResponse(`No course With the Id of ${req.params.id}`, 404))
    }




    res.status(200).json({
        success: true,
        data: course
    })
})


//@desc     Add a Course
//@route    POST /api/v1/bootcamps/:bootcampId/courses
//@access   Private
exports.createCourse = asyncHandler(async (req, res, next) => {

    req.body.bootcamp = req.params.bootcampId
    req.body.user = req.user._id

    const bootcamp = await Bootcamp.findById(req.params.bootcampId)

    if (!bootcamp) {
        return next(new ErrorResponse(`No Bootcamp With the Id of ${req.params.bootcampId}`, 404))
    }
    //Make sure that the bootcampowner is the user that is logged in
    if (bootcamp.user.toString() !== req.user._id.toString() && req.user.role !== "adming") {
        return next(new ErrorResponse(`User ${req.user._id} is not authorized to create course!`))
    }
    const newCourse = await Course.create(req.body)
    if (newCourse) {

        res.status(201).json({
            success: true,
            data: newCourse
        })
    }
})


//@desc     Update a Course
//@route    PUT /api/v1/courses/:id
//@access   Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
    let course = await Course.findById(req.params.id)


    if (!course) {
        return next(new ErrorResponse(`No Course With the Id of ${req.params.bootcampId}`, 404))
    }

    //Make sure user is couese owner
    //we chek the user id in the cous, with the id of the logged in user
    if (course.user.toString() !== req.user._id.toString() && req.user.role !== "adming") {
        return next(new ErrorResponse(`User ${req.user._id} is not authorized to update course ${course._id}!`))
    }
    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })
    if (course) {

        res.status(200).json({
            success: true,
            data: course
        })
    }
})



//@desc     Delete Course
//@route    DELETE /api/v1/courses/:id
//@access   Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
    let course = await Course.findById(req.params.id)
    if (!course) {
        return next(new ErrorResponse(`No Course With the Id of ${req.params.id}`, 404))
    }
    //Make sure that the bootcampowner is the user that is logged in
    if (course.user.toString() !== req.user._id.toString() && req.user.role !== "adming") {
        return next(new ErrorResponse(`User ${req.user._id} is not authorized to delete course!`))
    }

    await Course.findByIdAndDelete(req.params.id)
    res.status(200).json({
        success: true,
        data: {}
    })
})


