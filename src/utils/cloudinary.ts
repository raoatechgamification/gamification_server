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

// Define MIME types for videos and documents
const videoMimeTypes = [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/avi",
  "video/mkv",
  "video/quicktime",
  "video/x-msvideo", // AVI
  "video/x-flv", // Flash Video
];

const documentMimeTypes = [
  "application/pdf",
  "application/msword",  // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",  // .docx
  "application/vnd.ms-powerpoint", // .ppt
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
  "application/zip", // For archives
];

const imageMimeTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
];

// Multer configuration with validation for different file types
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 * 1024, // 5 GB file size limit
  },
  fileFilter: (req, file, cb) => {
    // Define allowed MIME types
    const allowedMimeTypes = [
      ...imageMimeTypes,
      ...videoMimeTypes,
      ...documentMimeTypes,
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new multer.MulterError(
          "LIMIT_UNEXPECTED_FILE",
          "Invalid file type. Only images, PDFs, documents, and videos are allowed."
        )
      );
    }
  },
});

// Cloudinary upload function with dynamic resource_type
interface UploadOptions {
  resource_type?: "image" | "video" | "raw" | "auto" | undefined;
  folder?: string;
  [key: string]: any;
}

export const cloudinaryUploadImg = async (
  fileToUploads: Buffer | string,
  folder: string,
  options: UploadOptions = {}
): Promise<string> => {
  try {
    return new Promise((resolve, reject) => {
      const uploadOptions: UploadOptions = {
        folder: folder,
        ...options,
      };

      // If the file is a buffer, use upload_stream
      if (Buffer.isBuffer(fileToUploads)) {
        const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
          if (error) {
            reject(error);
          } else {
            if (result) {
              resolve(result.secure_url);
            } else {
              reject(new Error("No result returned from Cloudinary"));
            }
          }
        });

        // End the stream with the buffer
        stream.end(fileToUploads);
      } else {
        const ext = path.extname(fileToUploads).toLowerCase();

        // Determine resource type based on file extension
        if (imageMimeTypes.some((mime) => fileToUploads.includes(mime))) {
          uploadOptions.resource_type = "image";  // For image files
        } else if (videoMimeTypes.some((mime) => fileToUploads.includes(mime))) {
          uploadOptions.resource_type = "video";  // For video files
        } else if (documentMimeTypes.some((mime) => fileToUploads.includes(mime))) {
          uploadOptions.resource_type = "raw";  // For documents and raw files
        } else {
          uploadOptions.resource_type = "auto";  // Auto-detect if not image/video/document
        }

        cloudinary.uploader.upload(
          fileToUploads,
          uploadOptions,
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              if (result) {
                resolve(result.secure_url);
              } else {
                reject(new Error("No result returned from Cloudinary"));
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
      cloudinary.uploader.destroy(fileToDelete, {}, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.result === "ok");
        }
      });
    });
  } catch (error) {
    throw new Error(String(error));
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