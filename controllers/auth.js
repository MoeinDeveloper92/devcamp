const ErrorResponse = require("../utils/errorResponse")
const User = require("../models/User")
const asyncHandler = require("../middleware/async")
//@desc     Register a user
//@route    POST api/v1/auth/register
//@access   pivli
exports.register = asyncHandler(async (req, res, next) => {
    const { name, email, password, role } = req.body
    //create user
    const user = await User.create({
        name,
        email,
        password,
        role
    })

    //keep in mind that, static is called on theModel , but method called on the created resource that we getting from db
    //creat etoken
    const token = user.getSignedJwtToken()
    res.status(201).json({
        success: true,
        token
    })

})



//@desc     login user
//@route    POST /api/v1/auth/login
//@access   Public
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body

    //Validate email & password
    if (!email || !password) {
        return next(new ErrorResponse("Please provide an email and a password!", 400))
    }
    //check for the user
    //+password means hey please add password, since in the model we excelude it
    const user = await User.findOne({ email }).select("+password")

    if (!user) {
        return next(new ErrorResponse("Invalid Credentials!", 401))
    }

    //check if password matches
    const isMatch = await user.matchPassword(password)

    if (!isMatch) {
        return next(new ErrorResponse("Invalid Credentials", 401))
    }

    //create Token
    const token = user.getSignedJwtToken()

    res.status(200).json({ success: true, token })


})