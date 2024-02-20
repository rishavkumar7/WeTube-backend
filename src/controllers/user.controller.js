import { asyncHandler } from "./../utils/asyncHandler.js";
import { ApiError } from "./../utils/ApiError.js";
import { User } from "./../models/user.model.js";
import { uploadOnCloudinary } from "./../utils/cloudinary.js";
import { ApiResponse } from "./../utils/ApiResponse.js";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});

        return {accessToken, refreshToken};
    } catch (error) {
        throw new ApiError(500, "something went wrong while generating access and refresh tokens");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { fullname, username, email, password } = req.body;   // fetching the request body data

    if ([fullname, username, email, password].some((field) => (!field || field?.trim() === ""))) {   // validations for empty fields
        throw new ApiError(400, "fullname, username, email, password is required");
    }

    const existingUser = await User.findOne({$or: [{ username }, { email }]});    // fetching an existing user with same username/email from db

    if (existingUser) {     // restricting duplicate entry of user
        throw new ApiError(409, "A user with same username/email already exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;     // fetching local path of avatar's uploaded image by multer in the backend server for uploading in cloudinary
    let coverImageLocalPath = "";    // // fetching local path of coverImage's uploaded image by multer in the backend server for uploading in cloudinary
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0]?.path;
    }

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

const loginUser = asyncHandler(async (req, res) => {
    const { email, userName, password } = req.body;   // fetching the request body data

    if (!userName && !email) {   // validating userName/email
        throw new ApiError(400, "userName/email is missing");
    }

    const user = await User.findOne({   // fetching user from db
        $or: [{userName}, {email}]
    })

    if (!user) {    // validating if user exists
        throw new ApiError(404, "user does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);    // checking if password is correct

    if (!isPasswordValid) {    // password validation response
        throw new ApiError(401, "invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);    // generating new access and refresh tokens

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");    // fetching user with updated refresh token from db

    const options = {    // options for cookies
        httpOnly: true,
        secure: true
    };

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(200, {
            user: loggedInUser,
            accessToken,
            refreshToken
        }, "user logged in successfully")
    );
});

export { registerUser, loginUser, logoutUser };