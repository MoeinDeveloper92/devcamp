const ErrorResponse = require("../utils/errorResponse")
const User = require("../models/User")
const asyncHandler = require("../middleware/async")
//@desc     Register a user
//@route    POST api/v1/auth/register
//@access   pivli
exports.register = asyncHandler(async (req, res, next) => {
    res.status(200).json({
        success: true,
    })
})