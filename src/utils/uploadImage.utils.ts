import multer, { FileFilterCallback } from "multer";
import { Request, Response, NextFunction } from "express";
import { cloudinaryUploadImg } from "./cloudinary";

// Extend Request interface to include `images` and `image`
declare global {
  namespace Express {
    interface Request {
      images?: { [key: string]: string };
      image?: string;
    }
  }
}

// Define the storage configuration for Multer
const storage = multer.diskStorage({});

// Define the file filter function
const multerFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (file.mimetype.startsWith("image/") || file.mimetype === "application/pdf") {
    cb(null, true); // Accept the file
  } else {
    cb(null, false); // Reject the file without throwing an error
  }
};

// Configure Multer
export const Multer = multer({
  storage: storage,
  fileFilter: multerFilter,
  limits: { fileSize: 52428800 }, // Limit to 50 MB
});

// Define the uploadImages middleware function
export const uploadImages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const uploader = (path: string) => cloudinaryUploadImg(path, "thrift");
      const urls: { [key: string]: string } = {};
  
      if (req.files && !Array.isArray(req.files) && typeof req.files === "object") {
        const fields = Object.keys(req.files);
  
        for (const field of fields) {
          const files = req.files[field]; // Safely access the field
  
          if (Array.isArray(files)) {
            // Multiple files
            for (const file of files) {
              const { path } = file;
              const newpath = await uploader(path);
              urls[field] = newpath;
            }
          }
        }
        req.images = urls; // Attach URLs to the request object
      } else if (req.file) {
        const { path } = req.file; // Single file upload
        const newpath = await uploader(path);
        req.image = newpath; // Attach the single image URL to the request object
      }
  
      next(); // Proceed to the next middleware
    } catch (error) {
      console.error(error);
      next(error); // Pass error to the error handler
    }
  };
  