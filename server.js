const path = require("path")
const express = require("express")
const bootCampRoutes = require("./routes/bootcampsRoutes")
const coursRoutes = require("./routes/coursesRoutes")
const authRoutes = require("./routes/auth")
const userRoutes = require("./routes/users")
const reviewRoutes = require("./routes/reviewRoutes")
const mongoSanitize = require("express-mongo-sanitize")
const helmet = require("helmet")
const xss = require("xss-clean")
const fileUpload = require("express-fileupload")
const cookieParse = require("cookie-parser")
// const logger = require("./middleware/logger")
const morgan = require("morgan")
const dotenv = require("dotenv").config({
    path: "./config/config.env"
})
const errorHandler = require("./middleware/error")
const colors = require("colors")
const mongoClient = require("./config/db")





const appServer = async () => {
    await mongoClient.connectDB()
    //PORT
    const PORT = process.env.PORT || 5000


    const app = express()

    //add Body Parse
    app.use(express.json())
    app.use(express.urlencoded({ extended: false }))

    //Cookie Parser
    app.use(cookieParse())
    //Dev Logging Middleware
    //I only want this to run if we are in development
    if (process.env.NODE_ENV === "development") {
        app.use(morgan("dev"))
    }

    //File Uploading
    app.use(fileUpload())


    //Set Securoty Headers
    app.use(helmet())

    //Prevent XSS attacks
    app.use(xss())

    //Sanitize Data
    app.use(mongoSanitize())

    //set static folder
    app.use(express.static(path.join(__dirname, "public")))

    //Routes
    app.use("/api/v1/bootcamps", bootCampRoutes)
    app.use("/api/v1/courses", coursRoutes)
    app.use("/api/v1/auth", authRoutes)
    app.use("/api/v1/users", userRoutes)
    app.use("/api/v1/reviews", reviewRoutes)

    app.use((req, res, next) => {
        res.status(404).json({
            message: 'Ohh you are lost, read the API documentation to find your way back home :)'
        })
    })

    //Error Middleware
    app.use(errorHandler)

    const server = app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode on PORT:${PORT}`["yellow", "bold"])
    })

    //stop applcaiton if we get unhandlerd rejection
    //Handler unhandled rejections or promise rejection
    process.on("unhandledRejection", (err, promise) => {
        console.log(`Error: ${err.message}`.red)
        //Close Server & Exit Process
        server.close(() => {
            //code 1 means exit with failure!
            process.exit(1)
        })
    })
}


appServer()

