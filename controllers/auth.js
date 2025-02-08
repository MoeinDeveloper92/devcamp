const ErrorResponse = require("../utils/errorResponse")
const User = require("../models/User")
const asyncHandler = require("../middleware/async")
const crypto = require("crypto")
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

//@desc     Log user out / clear cookie    
//@route    GET/api/v1/auth/logout
//@access   private
exports.logout = asyncHandler(async (req, res, next) => {
    res.cookie("token", "none", {
        expires: new Date(Date.now() + 3 * 1000),
        httpOnly: true
    })
    res.status(200).json({
        success: true,
        data: {}
    })
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

//@desc     Update user's details  
//@route    PUT/api/v1/auth/updatedetails
//@access   private
exports.updateDetails = asyncHandler(async (req, res, next) => {
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email
    }

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        success: true,
        data: user
    })
})



//@desc     Update user's password 
//@route    PUT/api/v1/auth/updatepassword
//@access   private
exports.updatePassword = asyncHandler(async (req, res, next) => {
    //in this route the user will send the current passwor dnad the new password
    const user = await User.findById(req.user._id).select("+password")

    //Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
        return next(new ErrorResponse("Current password is incorrect!", 401))
    }

    user.password = req.body.newPassword

    await user.save()

    //here we need to destry the roken and issue it again which force th user to login
    sendTokenResponse(user, 200, res)
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
            success: true,
            data: "Email sent"
        })
    } catch (error) {
        console.log(error)
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined

        await user.save({ validateBeforeSave: false })

        return next(new ErrorResponse("Email Could not to be sent!", 500))
    }
})

//@desc     Reset Password
//@route    PUT /api/v1/auth/resetpassword/:resetToken
//@access   Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
    //Get hashed token
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.resetToken)
        .digest("hex")

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    })

    if (!user) {
        return next(new ErrorResponse(`Your token has been expired. Please Try again`, 400))
    }

    //set New Passowrd
    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save()

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