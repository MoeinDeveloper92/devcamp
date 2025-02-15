const mongoose = require("mongoose")



class MongoClient {
    async connectDB() {
        try {
            const conn = await mongoose.connect(process.env.MONGODB_URI, {})
            console.log(`MongoDB Connected:${conn.connection.host}`.cyan.underline.bold)
        } catch (error) {
            console.log("Error=>>>", error)
            process.exit(1)
        }
    }
}

const mongoClient = new MongoClient()


module.exports = mongoClient