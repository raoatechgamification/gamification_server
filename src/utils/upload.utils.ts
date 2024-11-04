import multer from "multer";
import AWS from "aws-sdk";
import path from "path";
import { Request } from 'express';

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
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
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new multer.MulterError(
          "LIMIT_UNEXPECTED_FILE",
          "Invalid file type. Only images, PDFs, and documents are allowed."
        )
      );
    }
  },
});

const storage = multer.memoryStorage() 

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== '.xlsx' && ext !== '.xls') {
    cb(new Error('Only Excel files are allowed'), false);
  } else {
    cb(null, true);
  }
};
export const bulkUpload = multer({ storage, fileFilter });

export const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
});
