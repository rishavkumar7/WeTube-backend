import { asyncHandler } from "./../utils/asyncHandler.js";
import { ApiError } from "./../utils/ApiError.js";
import { User } from "./../models/user.model.js";
import { uploadOnCloudinary } from "./../utils/cloudinary.js";
import { ApiResponse } from "./../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    const { fullname, username, email, password } = req.body;   // fetching the request body data

    if ([fullname, username, email, password].some((field) => (field?.trim() === ""))) {   // validations for empty fields
        throw new ApiError(400, "fullname, username, email, password is missing");
    }

    const existedUser = User.findOne({$or: [{ username }, { email }]});    // fetching an existing user with same username/email from db

    if (existingUser) {     // restricting duplicate entry of user
        throw new ApiError(409, "A user with same username/email already exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;     // fetching local path of avatar's uploaded image by multer in the backend server for uploading in cloudinary
    const coverImageLocalPath = req.files?.coverImage[0]?.path;    // // fetching local path of coverImage's uploaded image by multer in the backend server for uploading in cloudinary

    if (!avatarLocalPath) {    // checking if avatar's local path is there in the backend server or not (if not then avatar wasn't uploaded through frontend)
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);     // uploading avatar on cloudinary using backend server's avatar's local path
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);     // uploading coverImage on cloudinary using backend server's coverImage's local path

    if (!avatar) {    // checking if cloudinary upload for avatar failed or not
        throw new ApiError(400, "Avatar file is required");
    }

    const user = await User.create({      // storing user in db
        fullname,
        username: username.toLowerCase(),
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");    // fetching user data (excluding password, refreshToken) from db

    if (!createdUser) {    // checking if user was stored properly in db or not
        throw new ApiError(500, "Registration of user failed");
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );
});

export { registerUser };