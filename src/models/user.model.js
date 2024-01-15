import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema({
    watchHistory: [{
        type: Schema.Types.ObjectId,
        ref: "Video"
    }],
    username: {
        type: String,
        required: [true, "Username is Required"],
        unique: [true, "Username should be Unique"],
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: [true, "Email is Required"],
        unique: [true, "Email should be Unique"],
        lowercase: true,
        trim: true
    },
    fullname: {
        type: String,
        required: [true, "Fullname is Required"],
        trim: true,
        index: true
    },
    avatar: {
        type: String,   // cloudinary Url
        required: [true, "Avatar is Required"],
    },
    coverImage: {
        type: String    // cloudinary Url
    },
    password: {
        type: String,
        required: [true, "Password is Required"],
    },
    refreshToken: {
        type: String
    }
}, {
    timestamps: true
})

userSchema.pre("save", function(next) {
    if (!this.isModified("password")) {
        return next();
    }
    this.password = bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function() {
    return jwt.sign({
        _id: this._id,
        username: this.username,
        email: this.email,
        fullname: this.fullname
    }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    })
}

userSchema.methods.generateRefreshToken = function() {
    return jwt.sign({
        _id: this._id
    }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    })
}

export const User = mongoose.model("User", userSchema);