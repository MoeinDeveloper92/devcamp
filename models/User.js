const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
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

///bcryptjs
UserSchema.pre("save", async function (next) {
    //generaet a salt to use to hash the password
    //the more salt, the secure password but it adds more load to the system to be decrpyed
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
})


// Sign JWT and return
//This i smethod and we call it on actual user
//we can call this emthod within the contoller
UserSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    })
}


//Match user entered passowrd to hashed passwor din DB
//methods is called on the actude doc, which measn we have access to the fieldsby this
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}
const User = mongoose.model("User", UserSchema)
module.exports = User