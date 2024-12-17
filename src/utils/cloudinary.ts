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

// Multer upload configuration with file types allowed
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 * 1024,  // 5 GB file size limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint", // .ppt
      "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
      // Adding video mime types
      "video/mp4",
      "video/webm",
      "video/ogg",
      "video/avi",
      "video/mkv",
      "video/quicktime",
      "video/x-msvideo", // AVI
      "video/x-flv", // Flash Video
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

// Cloudinary upload function updated for images, videos, and other types
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

      // Check if fileToUploads is a buffer or a path
      if (Buffer.isBuffer(fileToUploads)) {
        // If it's a buffer, use upload_stream
        const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
          if (error) {
            reject(error);
          } else {
            // Check if result is not undefined
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
        // If it's a file path, use upload
        const ext = path.extname(fileToUploads).toLowerCase();

        // If it's a video file, force resource_type to "video"
        if ([".mp4", ".webm", ".avi", ".mkv", ".flv"].includes(ext)) {
          uploadOptions.resource_type = "video";
        } else if ([".ppt", ".pptx", ".pdf", ".docx"].includes(ext)) {
          uploadOptions.resource_type = "raw"; // For raw files like .ppt, .doc, etc.
        } else {
          uploadOptions.resource_type = "image"; // Default to "image" for non-video files
        }

        cloudinary.uploader.upload(
          fileToUploads,
          uploadOptions,
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              // Check if result is not undefined
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