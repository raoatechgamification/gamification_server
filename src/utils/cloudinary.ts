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
  // resource_type?: "image" | "video" | "raw" | "auto";
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
    // Detect MIME type based on the file
    const mimeType = typeof fileToUploads === "string" ? path.extname(fileToUploads).toLowerCase() : '';

    // Dynamically set resource_type based on file type
    let resourceType: "image" | "video" | "raw" | "auto" = "raw";  // Default to 'auto' to let Cloudinary decide

    // Check for image or video types based on MIME type
    if (mimeType && imageMimeTypes.includes(mimeType)) {
      resourceType = "image";
    } else if (mimeType && videoMimeTypes.includes(mimeType)) {
      resourceType = "video";
    }

    const uploadOptions: UploadOptions = {
      folder,
      resource_type: resourceType,
      ...options,
    };

    // Handle Buffer uploads
    if (Buffer.isBuffer(fileToUploads)) {
      const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
        if (error) return reject(new Error(`Cloudinary upload failed: ${error.message}`));
        if (result) return resolve(result.secure_url);
        reject(new Error("No result returned from Cloudinary"));
      });
      stream.end(fileToUploads);
    } else {
      // Handle file path uploads
      cloudinary.uploader.upload(fileToUploads, uploadOptions, (error, result) => {
        if (error) return reject(new Error(`Cloudinary upload failed: ${error.message}`));
        if (result) return resolve(result.secure_url);
        reject(new Error("No result returned from Cloudinary"));
      });
    }
  });
};

// export const cloudinaryUploadImg = async (
//   fileToUploads: Buffer | string,
//   folder: string,
//   options: UploadOptions = {}
// ): Promise<string> => {
//   if (!(Buffer.isBuffer(fileToUploads) || typeof fileToUploads === "string")) {
//     throw new Error("Invalid file input. Must be a Buffer or a file path.");
//   }

//   return new Promise((resolve, reject) => {
//     // Dynamically set resource_type based on file type
//     let resourceType: "image" | "video" | "raw" = "raw"; // Default to 'raw' for PDFs and other non-image files
//     const uploadOptions: UploadOptions = {
//       folder,
//       resource_type: resourceType,
//       ...options,
//     };

//     if (Buffer.isBuffer(fileToUploads)) {
//       const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
//         if (error) return reject(new Error(`Cloudinary upload failed: ${error.message}`));
//         if (result) return resolve(result.secure_url);
//         reject(new Error("No result returned from Cloudinary"));
//       });
//       stream.end(fileToUploads);
//     } else {
//       cloudinary.uploader.upload(fileToUploads, uploadOptions, (error, result) => {
//         if (error) return reject(new Error(`Cloudinary upload failed: ${error.message}`));
//         if (result) return resolve(result.secure_url);
//         reject(new Error("No result returned from Cloudinary"));
//       });
//     }
//   });
// };


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
