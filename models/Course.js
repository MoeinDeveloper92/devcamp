const mongoose = require("mongoose")

const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "please add a course title!"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "please add a course description"],
        trim: true,
    },
    weeks: {
        type: String,
        required: [true, "please add a number of weeks"]
    },
    tuition: {
        type: Number,
        required: [true, "please add a tuition cost!"]
    },
    minimumSkill: {
        type: String,
        required: [true, "Please add a minimum skill"],
        enum: ["beginner", "intermediate", "advanced"]
    },
    scholarshipAvailable: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    bootcamp: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bootcamp",
        required: true
    }
})
//we should create a relationship to bootcamps
//in mongoose we have static which is you call it on actual model
//Course.goFish()

//wehreas the method we would basically create a query  like const coursese = Course.find() and then we call a method on the coursess


//Static method to get the average of course tuitioon
CourseSchema.statics.getAverageCost = async function (bootcampId) {


    const obj = await this.aggregate([
        {
            $match: {
                bootcamp: bootcampId
            }
        },
        {
            // { group: { _id: <expression>, <field1>: { <accumulator1>: <expression1> }, ... } }
            $group: {
                // $_id: The field used to group documents. It can be an existing field or a computed expression
                _id: 'bootcamp',
                averageCost: { $avg: '$tuition' }
            }
        }
    ])

    try {
        //it will give us an integer
        await this.model("Bootcamp").findByIdAndUpdate(bootcampId, { averageCost: Math.ceil(obj[0].averageCost / 10) * 10 })
    } catch (error) {
        console.error(error)
    }
}

//1. Call get Average Cost After Save
CourseSchema.post("save", async function (next) {
    this.constructor.getAverageCost(this.bootcamp)
    next()
})

//2. Call getAverage Cost Before Remove
CourseSchema.pre("remove", async function (next) {
    //each course has a bootcamp Id
    this.constructor.getAverageCost(this.bootcamp)
    next()
})
const Course = mongoose.model("Course", CourseSchema)
module.exports = Course