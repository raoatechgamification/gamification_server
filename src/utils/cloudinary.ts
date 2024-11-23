import { v2 as cloudinary } from "cloudinary";
import { config } from "dotenv";

config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Define types for the upload options
interface UploadOptions {
  resource_type?: "image" | "video" | "raw" | "auto" | undefined;
  folder?: string;
  [key: string]: any; // Allow additional properties
}

// Updated function to handle both file paths and buffers
export const cloudinaryUploadImg = async (
  fileToUploads: Buffer | string,
  folder: string,
  options: UploadOptions = {}
): Promise<string> => {
  try {
    return new Promise((resolve, reject) => {
      const uploadOptions: UploadOptions = {
        resource_type: "auto",
        folder: folder,
        ...options,
      };

      // Check if fileToUploads is a buffer or a path
      if (Buffer.isBuffer(fileToUploads)) {
        // If it's a buffer, use upload_stream
        const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
          if (error) {
            reject(error);
          } else {
            if(result){
                 resolve(result.secure_url);
            }
           
          }
        });

        // End the stream with the buffer
        stream.end(fileToUploads);
      } else {
        // If it's a file path, use upload
        cloudinary.uploader.upload(
          fileToUploads,
          uploadOptions,
          (error, result) => {
            if (error) {
              reject(error);
            } else {
                if(result){
                     resolve(result.secure_url);
                }
             
            }
          }
        );
      }
    });
  } catch (error) {
    console.error(error);
    throw new Error(String(error));
  }
};

export const cloudinaryDeleteImg = async (fileToDelete: string): Promise<boolean> => {
  try {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(
        fileToDelete,
        {},
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result.result === "ok");
          }
        }
      );
    });
  } catch (error) {
    throw new Error(String(error));
  }
};