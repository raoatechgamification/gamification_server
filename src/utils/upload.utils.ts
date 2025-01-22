import multer from "multer";
import path from "path";
import { Request } from "express";

// Define allowed MIME types and extensions
const allowedMimeTypesForBulkUpload = [
  "application/vnd.ms-excel", // For .xls files
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // For .xlsx files
];

const allowedExtensionsForBulkUpload = [
  ".xls",
  ".xlsx",
];

const allowedMimeTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  
  "audio/mpeg", // MP3
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/avi",
  "video/mkv",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-flv",
];

const allowedExtensions = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".pdf",
  ".doc",
  ".docx",
  ".ppt",
  ".pptx",
  ".mp3", // MP3
  ".mp4",
  ".webm",
  ".ogg",
  ".avi",
  ".mkv",
  ".mov", // QuickTime
  ".flv",
];

// Multer configuration
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 * 1024, // 5GB file size limit
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(
        new multer.MulterError(
          "LIMIT_UNEXPECTED_FILE",
          "Invalid file type. Only images, PDFs, documents, audio, and videos are allowed."
        )
      );
    }
  },
});

// Additional bulk upload configuration (optional)
const storage = multer.memoryStorage();

export const bulkUpload = multer({
  storage,
  fileFilter: (req: any, file: Express.Multer.File, cb: any) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensionsForBulkUpload.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type for bulk upload"), false);
    }
  },
});

export const Optimizedupload = multer({
  storage: multer.memoryStorage(), // Keep files in memory
  limits: {
    fileSize: 512 * 1024 * 1024, // Limit file size to 512MB per file
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(
        new multer.MulterError(
          "LIMIT_UNEXPECTED_FILE",
          "Invalid file type. Only images, PDFs, documents, audio, and videos are allowed."
        )
      );
    }
  },
});
