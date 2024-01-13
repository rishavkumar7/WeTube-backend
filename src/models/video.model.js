import mongoose, {Schema} from "mongoose";

const videoSchema = new Schema({
    videoFile: {
        type: String,   // cloudinary Url
        required: [true, "Videofile is Required"]
    },
    thumbnail: {
        type: String,   // cloudinary Url
        required: [true, "Thumbnail is Required"]
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    title: {
        type: String,
        required: [true, "Title is Required"]
    },
    description: {
        type: String,
        required: [true, "Description is Required"]
    },
    duration: {
        type: Number,   // from cloudinary data
        required: [true, "Duration is Required"]
    },
    views: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

export const Video = mongoose.Model("Video", videoSchema);