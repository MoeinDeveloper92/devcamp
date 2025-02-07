const mongoose = require("mongoose")


const ReviewSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Please add a title for the Review!"],
        maxlength: 100,
        trim: true
    },
    text: {
        type: String,
        required: [true, "Please add some text"]
    },
    rating: {
        type: Number,
        required: [true, "Please add a rating between 1 and 10!"],
        min: 1,
        max: 10
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    bootcamp: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bootcamp",
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
})


//Static method to get the average rating andsave
ReviewSchema.statics.getAverageRating = async function (bootcampId) {
    const obj = await this.aggregate([
        {
            $match: {
                bootcamp: bootcampId
            }
        },
        {
            $group: {
                _id: "$bootcamp",
                averageRating: { $avg: "$rating" }
            }
        }
    ])

    try {
        await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
            averageRating: obj[0].averageRating
        })
    } catch (error) {
        console.error(error)
    }
}

//call getAverageRating after save
ReviewSchema.post("save", function () {
    this.constructor.getAverageRating(this.bootcamp)
})

//Call getAverageRating bvefore remove
ReviewSchema.pre("remove", function () {
    this.constructor.getAverageRating(this.bootcamp)
})

//A user can only leave one review per bootcamp
//Prevent user from submitting more than one review per bootcamp
ReviewSchema.index({
    bootcamp: 1,
    user: 1,
}, {
    unique: true
})

const Review = mongoose.model("Review", ReviewSchema)


module.exports = Review