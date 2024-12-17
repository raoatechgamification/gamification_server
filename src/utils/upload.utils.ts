import multer from "multer";
import path from "path";
import { Request } from 'express';

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

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 * 1024, 
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb) => {
    const allowedMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      // ...videoMimeTypes
      "video/mp3",
      "video/mp4",
      "video/webm",
      "video/ogg",
      "video/avi",
      "video/mkv",
      "video/quicktime",
      "video/x-msvideo", // AVI
      "video/x-flv", // Flash Video,
      "application/vnd.ms-powerpoint", // .ppt
      "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
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

const storage = multer.memoryStorage() 

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  // Allowing Excel, PowerPoint, PDF, Image, and Video file extensions
  const allowedExtensions = ['.xlsx', '.xls', '.ppt', '.pptx', '.pdf', '.jpeg', '.jpg', '.png', '.gif', '.mp4', '.webm', '.ogg', '.avi', '.mkv', '.quicktime', '.flv'];

  if (!allowedExtensions.includes(ext)) {
    cb(new Error('Invalid file type. Only Excel, PowerPoint, PDF, Image, and Video files are allowed'), false);
  } else {
    cb(null, true);
  }
};


export const bulkUpload = multer({ storage, fileFilter });
