const express = require("express")
const {
    getReviews,
    getReview,
    addReview,
    updateReview,
    deleteReview
} = require("../controllers/reviewController")
const Review = require("../models/Review")
const router = express.Router({ mergeParams: true })
const advancedResults = require("../middleware/advancedResult")
const { protected, roleGuard } = require("../middleware/auth")



router.route("/")
    .get(advancedResults(Review, { path: 'bootcamp', select: "name description" }), getReviews).post(protected, roleGuard("user", "admin"), addReview)
router.route("/:id")
    .get(getReview)
    .put(protected, roleGuard("user", "admin"), updateReview)
    .delete(protected, roleGuard("user", "admin"), deleteReview)
module.exports = router