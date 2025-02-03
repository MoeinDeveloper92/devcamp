const mongoose = require("mongoose")
const slugify = require("slugify")
const geocoder = require("../utils/geocoder")
const BootcampSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "name field is required for bootcamp creation."],
        unique: true,
        trim: true,
        maxlength: [50, "Name cannot be more than 50 characters!"]
    },
    // slug is a URL-freindly version of the name,
    slug: String,
    description: {
        type: String,
        required: [true, "decription is required"],
        maxlength: [500, "Description cannot be more than 500 characters"]
    },
    website: {
        type: String,
        //for matching, we use regular expression
        //this is regular experssion for http and https webiste
        //you can get it from stack overflow
        //seach Javascript regex url
        //What is a good regex for http https website
        //you can also search for email
        match: [/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/, "Please use a valid URL with HTTP or HTTPs"]
    },
    phone: {
        type: String,
        maxLength: [20, "Phone number cannot be longer than 20 characters!"]
    },
    email: {
        type: String,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please add a valid email!"]
    },
    // This address is sent from the clioent
    //later we convert it to lat, lang,by geocioder
    //
    address: {
        type: String,
        required: [true, "Please add an address"]
    },
    location: {
        //GROJSON Point
        type: {
            type: String,
            enum: ["Point"],
            required: false
        },
        coornidates: {
            type: [Number],
            required: false,
            index: "2dsphere"
        },
        formattedAddress: {
            type: String,
            required: false
        },
        street: {
            type: String,
            required: false
        },
        city: {
            type: String,
            required: false
        },
        state: {
            type: String,
            required: false
        },
        zipcode: {
            type: String,
            required: false
        },
        country: {
            type: String,
            required: false
        }
    },
    careers: {
        //Array of strings
        type: [String],
        required: true,
        enum: [
            "Web Development",
            "Mobile Development",
            "UI/UX",
            "Data Science",
            "Business",
            "Other"
        ]
    },
    averageRating: {
        type: Number,
        min: [1, "Rating must be at least 1"],
        max: [10, "Rating cannot be more than 10"]
    },
    averageCost: {
        type: Number,

    },
    photo: {
        type: String,
        default: "no-photo.jpg"
    },
    housing: {
        type: Boolean,
        default: false
    },
    jobAssistance: {
        type: Boolean,
        default: false
    },
    jobGurantee: {
        type: Boolean,
        default: false
    },
    acceptGi: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

//Create Bootcamp Slug from the name
BootcampSchema.pre("save", function (next) {
    this.slug = slugify(this.name, { lower: true })
    next()
})

// Geocoder and create location field
BootcampSchema.pre("save", async function (next) {
    // const loc = await geocoder.geocode(this.address)
    this.location = {
        type: "Point",
        coornidates: [-70.776, 78.2312],
        formattedAddress: this.address,
        street: "Padad",
        city: "Ahwaz",
        state: "Khouzestan",
        zipcode: "1231",
        country: "Iran"
    }
    //Do not save address in DB
    this.address = undefined
    next()
})

//Cascade delete course when a bootcamp is deleted
BootcampSchema.pre("remove", async function (next) {
    console.log(`Courses being removed from Bootcamp=>>>> ${this._id}`)
    //we want to delete course
    await this.model("Course").deleteMany({ bootcamp: this._id })
    next()
})

//Reverse populate with virtuals
BootcampSchema.virtual("courses", {
    ref: "Course",
    localField: "_id",
    foreignField: "bootcamp",
    justOne: false
})

const Bootcamp = mongoose.model("Bootcamp", BootcampSchema)
module.exports = Bootcamp