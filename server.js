const path = require("path")
const express = require("express")
const bootCampRoutes = require("./routes/bootcampsRoutes")
const coursRoutes = require("./routes/coursesRoutes")
const fileUpload = require("express-fileupload")
// const logger = require("./middleware/logger")
const morgan = require("morgan")
const dotenv = require("dotenv").config({
    path: "./config/config.env"
})
const errorHandler = require("./middleware/error")
const colors = require("colors")
const connectDB = require("./config/db")

connectDB()
//PORT
const PORT = process.env.PORT || 5000


const app = express()

//add Body Parse
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

//Dev Logging Middleware
//I only want this to run if we are in development
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"))
}

//File Uploading
app.use(fileUpload())

//set static folder
app.use(express.static(path.join(__dirname, "public")))

//Routes
app.use("/api/v1/bootcamps", bootCampRoutes)
app.use("/api/v1/courses", coursRoutes)

app.use((req, res, next) => {
    res.status(404).json({
        message: 'Ohh you are lost, read the API documentation to find your way back home :)'
    })
})

//Error Middleware
app.use(errorHandler)

const server = app.listen(PORT, () => {
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




////////////////////////////
//in mongooe we have a poiece of middleware, when the user wants to create a bootcamp it uses geocoder, where it takes the actual addres and convers the address to geo locaiton, lat,lang. by
//mapquest ... in mongoose we have geojson type