const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {

    //make a copy of the err
    let error = { ...err }
    error.message = err.message

    // console.log(err)
    //1.Mongoose Bad Object Id
    if (err.name === "CastError") {
        const message = `Resource not found!`;
        error = new ErrorResponse(message, 404)
    }

    //2.Mogoose Duplicate Key
    if (err.code === 11000) {
        const message = 'Duplicate field value entered!'
        error = new ErrorResponse(message, 400)
    }

    //3.Mongoose validation Error
    if (err.name === "ValidationError") {
        const message = Object.values(err.errors).map(val => val.message)
        error = new ErrorResponse(message, 400)
    }
    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || "Internal Server Error!"
    })
    next()
}


module.exports = errorHandler