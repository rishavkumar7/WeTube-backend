import mongoose, {Schema} from "mongoose";

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

export const User = mongoose.model("User", userSchema);