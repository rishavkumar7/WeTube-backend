import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
    try{
        if (!localFilePath) {
            return null;
        }
        //upload file on cloudinary
        const response = await cloudinary.uploader.upload(
            localFilePath, {
                resource_type: "auto"
            }
        )
        //file successfully uploaded on cloudinary
        console.log("file has been uploaded successfully on cloudinary", response.url);
        fs.unlinkSync(localFilePath);    // removing the temporarily saved local file as upload succeeded on cloudinary and we don't need them now in backend server
        return response;
    } catch(error) {
        fs.unlinkSync(localFilePath);    // removing the temporarily saved local file as upload failed
        return null;
    }
}

export { uploadOnCloudinary };