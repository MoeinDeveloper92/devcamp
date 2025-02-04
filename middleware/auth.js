const jwt = require("jsonwebtoken")
const asyncHandler = require("./async")
const ErrorResponse = require("../utils/errorResponse")
const User = require("../models/User")


//Protect Routes

exports.protected = asyncHandler(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1]
    }
    // else if (req.cookies.token) {
    //     token = req.cookies.token
    // }

    //Make sure token exists
    if (!token) {
        return next(new ErrorResponse("Not Auhtorized to access this route!", 401))
    }
    //verify the token
    try {
        //verify token
        //extract the payload from the token
        // { id: '67a112757f960d7bc608d887', iat: 1738660446, exp: 1741252446 }
        const decoded = jwt.decode(token, process.env.JWT_SECRET)
        //This decioded objet holds our payload
        console.log(decoded)
        //this user is the curerntly logged in user!!!
        req.user = await User.findById(decoded.id)

        next()
    } catch (error) {
        return next(new ErrorResponse("Not Auhtorized to access this route!", 401))
    }
})


//Gran access to specific role
exports.roleGuard = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorResponse(`User role ${req.user.role} is unauthorized to access this route!`, 403))
        }

        next()
    }
}