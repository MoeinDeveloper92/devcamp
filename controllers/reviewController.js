const Bootcamp = require("../models/Bootcamp")
const Review = require("../models/Review")
const ErrorResposne = require("../utils/errorResponse")
const asyncHandler = require("../middleware/async")

//@desc     Get reviews
//@route    GET / api/v1/reviews
//@route    GET /api/v1/bootcamp/:bootcampId/review
//@access   public
exports.getReviews = asyncHandler(async (req, res, next) => {
    if (req.params.bootcampId) {
        const reviews = await Review.find({ bootcamp: req.params.bootcampId })

        return res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        })
    } else {
        res.status(200).json(res.advancedResults)
    }
})



//@desc     Get a single review
//@route    GET / api/v1/reviews/:id
//@access   public
exports.getReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id).populate({
        path: "bootcamp",
        select: "name description"
    })

    if (!review) {
        return next(new ErrorResposne(`No Review Found with the Id of ${req.params.id}`, 404))
    }

    res.status(200).json({
        success: true,
        data: review
    })
})


//@desc     add review for bootcamp
//@route    POST / api/v1/bootcamps/:bootcampId/reviews
//@access   Private / You have to be a user for the bootcamop
exports.addReview = asyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId
    req.body.user = req.user._id
    const bootcamp = await Bootcamp.findById(req.params.bootcampId)
    if (!bootcamp) {
        return next(new ErrorResposne(`No Bootcamp with the id of ${req.params.bootcampId}`, 404))
    }

    const checkForRewview = await Review.find({ bootcamp: req.params.bootcampId, user: req.user._id })

    if (checkForRewview.length !== 0) {
        return next(new ErrorResposne("You cannot leave more than 1 review for a bootcamp", 400))
    }
    const review = await Review.create(req.body)

    res.status(201).json({
        success: true,
        data: review
    })
})

//@desc     Update a Review
//@route    PUT /api/v1/rerviews/:id
//@access   Private
exports.updateReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id)

    if (!review) {
        return next(new ErrorResposne(`No Review with the id of ${req.params.id}`, 404))
    }

    //we need to make sure the review belongs to the logged in user or user is an admin
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
        return next(new ErrorResposne(`Not Authorized to update a review!`, 401))
    }

    const updatedReview = await Review.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        success: true,
        data: updatedReview
    })
})


//@desc     Delete a Review
//@route    DELETE /api/v1/rerviews/:id
//@access   Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id)

    if (!review) {
        return next(new ErrorResposne(`No Review with the id of ${req.params.id}`, 404))
    }

    //we need to make sure the review belongs to the logged in user or user is an admin
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
        return next(new ErrorResposne(`Not Authorized to Delete a review!`, 401))
    }

    await Review.findByIdAndDelete(req.params.id)

    res.status(200).json({
        success: true,
        data: {}
    })
}) 