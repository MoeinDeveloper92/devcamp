const express = require("express")
const bootCampRoutes = require("./routes/bootcamps")
const dotenv = require("dotenv").config({
    path: "./config/config.env"
})
//PORT
const PORT = process.env.PORT || 5000

const app = express()

//Routes
app.use("/api/v1/bootcamps", bootCampRoutes)

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on PORT:${PORT}`)
})