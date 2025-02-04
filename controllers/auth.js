const ErrorResponse = require("../utils/errorResponse")
const User = require("../models/User")
const asyncHandler = require("../middleware/async")
//@desc     Register a user
//@route    POST api/v1/auth/register
//@access   private
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
    sendTokenResponse(user, 200, res)

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
    sendTokenResponse(user, 200, res)

})


//get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    //createtoekn
    const token = user.getSignedJwtToken();
    const options = {
        //this should give us 30 days
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        //we only want the cookie to be accessed thoruhgb client side
        httpOnly: true,
    }
    if (process.env.NODE_ENV === "production") {
        options["secure"] = true
    }
    res
        .status(statusCode)
        .cookie("token", token, options)
        .json({ success: true, token })
}