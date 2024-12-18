import multer from "multer";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import { config } from "dotenv";

config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Define MIME types
const imageMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
const videoMimeTypes = ["video/mp4", "video/webm", "video/ogg", "video/avi", "video/mkv", "video/quicktime"];
const documentMimeTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/zip",
];

// Multer configuration
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 * 1024 }, // 5 GB
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [...imageMimeTypes, ...videoMimeTypes, ...documentMimeTypes];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Invalid file type."));
    }
  },
});

// Cloudinary upload
interface UploadOptions {
  resource_type?: "image" | "video" | "raw" | "auto";
  folder?: string;
  [key: string]: any;
}

export const cloudinaryUploadImg = async (
  fileToUploads: Buffer | string,
  folder: string,
  options: UploadOptions = {}
): Promise<string> => {
  if (!(Buffer.isBuffer(fileToUploads) || typeof fileToUploads === "string")) {
    throw new Error("Invalid file input. Must be a Buffer or a file path.");
  }

  return new Promise((resolve, reject) => {
    try {
      const uploadOptions: UploadOptions = { 
        folder, 
        resource_type: "raw",
        ...options 
      };

      if (Buffer.isBuffer(fileToUploads)) {
        const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
          if (error) {
            return reject(new Error(`Cloudinary upload failed: ${error.message}`));
          }
          if (result) {
            return resolve(result.secure_url);
          }
          reject(new Error("No result returned from Cloudinary"));
        });
        stream.end(fileToUploads);
      } else {
        cloudinary.uploader.upload(
          fileToUploads,
          uploadOptions,
          (error, result) => {
            if (error) {
              return reject(new Error(`Cloudinary upload failed: ${error.message}`));
            }
            if (result) {
              return resolve(result.secure_url);
            }
            reject(new Error("No result returned from Cloudinary"));
          }
        );
      }
    } catch (error) {
      reject(new Error(`Unexpected error during Cloudinary upload: ${error}`));
    }
  });
};


// Cloudinary delete
export const cloudinaryDeleteImg = async (fileToDelete: string): Promise<boolean> => {
  try {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(fileToDelete, {}, (error, result) => {
        if (error) reject(new Error(`Cloudinary delete failed: ${error.message}`));
        resolve(result.result === "ok");
      });
    });
  } catch (error) {
    throw new Error(`Cloudinary delete error: ${error}`);
  }
};



// import { v2 as cloudinary } from "cloudinary";
// import { config } from "dotenv";

// config();
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // Define types for the upload options
// interface UploadOptions {
//   resource_type?: "image" | "video" | "raw" | "auto" | undefined;
//   folder?: string;
//   [key: string]: any; // Allow additional properties
// }

// // Updated function to handle both file paths and buffers
// export const cloudinaryUploadImg = async (
//   fileToUploads: Buffer | string,
//   folder: string,
//   options: UploadOptions = {}
// ): Promise<string> => {
//   try {
//     return new Promise((resolve, reject) => {
//       const uploadOptions: UploadOptions = {
//         resource_type: "auto",
//         folder: folder,
//         ...options,
//       };

//       // Check if fileToUploads is a buffer or a path
//       if (Buffer.isBuffer(fileToUploads)) {
//         // If it's a buffer, use upload_stream
//         const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
//           if (error) {
//             reject(error);
//           } else {
//             if(result){
//                  resolve(result.secure_url);
//             }
           
//           }
//         });

//         // End the stream with the buffer
//         stream.end(fileToUploads);
//       } else {
//         // If it's a file path, use upload
//         cloudinary.uploader.upload(
//           fileToUploads,
//           uploadOptions,
//           (error, result) => {
//             if (error) {
//               reject(error);
//             } else {
//                 if(result){
//                      resolve(result.secure_url);
//                 }
             
//             }
//           }
//         );
//       }
//     });
//   } catch (error) {
//     console.error(error);
//     throw new Error(String(error));
//   }
// };

// export const cloudinaryDeleteImg = async (fileToDelete: string): Promise<boolean> => {
//   try {
//     return new Promise((resolve, reject) => {
//       cloudinary.uploader.destroy(
//         fileToDelete,
//         {},
//         (error, result) => {
//           if (error) {
//             reject(error);
//           } else {
//             resolve(result.result === "ok");
//           }
//         }
//       );
//     });
//   } catch (error) {
//     throw new Error(String(error));
//   }
// };