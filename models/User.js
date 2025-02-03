const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add a name!"]
    },
    email: {
        type: String,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please add a valid email!"],
        required: [true, "Please add an email!"],
        unique: true
    },
    role: {
        type: String,
        enum: ["user", "publisher", "admin"],
        default: "user"
    },
    password: {
        type: String,
        required: [true, "Please add a password!"],
        minlength: 6,
        // when we get a user thorugh an api, it won't show the password 
        select: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
})


const User = mongoose.model("User", UserSchema)
module.exports = User