const express = require("express")
const dotenv = require("dotenv").config({
    path: "./config/config.env"
})
//PORT
const PORT = process.env.PORT || 5000

const app = express()

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on PORT:${PORT}`)
})