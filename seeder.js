const fs = require("fs")
const mongoose = require("mongoose")
const colors = require("colors")
const dotenv = require("dotenv")

//Load nev
dotenv.config({
    path: "./config/config.env"
})

//Load Models
const Bootcamp = require("./models/Bootcamp")
const Course = require("./models/Course")

//Conenct DB
mongoose.connect(process.env.MONGODB_URI)

//read JSON file
const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, "utf-8"))
const courses = JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`, "utf-8"))
//Import bootcamp to the database
const importData = async () => {
    try {
        await Bootcamp.create(bootcamps)
        await Course.create(courses)
        console.log(`Data Imorted...`.green.inverse)
        process.exit()
    } catch (error) {
        console.error(error)
    }
}


//Delete Bulk
const deleteData = async () => {
    try {
        await Bootcamp.deleteMany()
        await Course.deleteMany()
        console.log(`Data Destroyed...`.red.inverse)
        process.exit()
    } catch (error) {
        console.error(error)
    }
}

if (process.argv[2] === '-i') {
    importData()
} else if (process.argv[2] === "-d") {
    deleteData()
}



// console.log(process.argv)
//process.argv is an array in Nodejs that ontains command-line arguments passed when running a script.//
//node seeder -i ===> [ 'C:\\Program Files\\nodejs\\node.exe', 'E:\\devcamp\\seeder', '-d' ]