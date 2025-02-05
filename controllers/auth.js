const ErrorResponse = require("../utils/errorResponse")
const User = require("../models/User")
const asyncHandler = require("../middleware/async")

const sentEmial = require("../utils/sendEmail")
const sendEmail = require("../utils/sendEmail")



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


//@desc   Get current logged in user     
//@route    POST/api/v1/auth/me
//@access   private
exports.getMe = asyncHandler(async (req, res, next) => {
    //and now we have access to the req.user
    const user = await User.findById(req.user._id)

    res.status(200).json({
        success: true,
        data: user
    })
})



//@desc     Forgot password   
//@route    POST/api/v1/auth/forgotpassword
//@access   public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    //get the user byu email sendt by the body
    const user = await User.findOne({ email: req.body.email })

    if (!user) {
        return next(new ErrorResponse("There is no user with that Email!", 404))
    }

    //we want to get the Reset token
    const resetToken = user.getResetPasswordToken()
    await user.save({ validateBeforeSave: false })


    //create Reset URL
    const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/resetpassword/${resetToken}`
    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`


    try {
        await sendEmail({
            email: user.email,
            subject: `Password reset token`,
            message
        })

        res.status(200).json({

        })
    } catch (error) {

    }
    res.status(200).json({
        success: true,
        data: user
    })
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