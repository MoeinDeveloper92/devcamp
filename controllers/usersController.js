const ErrorResponse = require("../utils/errorResponse")
const asyncHandler = require("../middleware/async")
const User = require("../models/User")


//@desc     Get all the users 
//@route    GET /api/v1/users
//@access   Private - only admin
exports.getUsers = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults)
})


//@desc     Get single User
//@route    GET /api/v1/users/:id
//@access   Private - only admin
exports.getUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id)

    res.status(200).json({
        success: true,
        data: user
    })
})


//@desc     Create A User
//@route    POST /api/v1/users
//@access   Private - only admin
exports.createUser = asyncHandler(async (req, res, next) => {
    const user = await User.create(req.body)

    res.status(201).json({
        success: true,
        data: user
    })
})




//@desc     Update a user
//@route    PUT /api/v1/users/:id
//@access   Private - only admin
exports.updateUser = asyncHandler(async (req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        success: true,
        data: updatedUser
    })
})




//@desc     Delete a user
//@route    DELETE /api/v1/users/:id
//@access   Private - only admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.params.id)

    res.status(200).json({
        success: true,
        message: `User with id ${req.params.id} has been deleted`,
        data: {}
    })
})