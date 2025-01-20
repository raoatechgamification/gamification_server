import { Readable } from "stream";
import cloudinary from "../config/cloudinary.config";
export const uploadToCloudinary = async (
  fileBuffer: Buffer,
  mimetype: string,
  folder: string
) => {
  console.log(fileBuffer, mimetype);
  try {
    const fileBase64 = `data:${mimetype};base64,${fileBuffer.toString("base64")}`;
    const result = await cloudinary.uploader.upload(fileBase64, {
      folder,
      resource_type: "auto",
    });
    return result;
  } catch (error: any) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  [key: string]: any; // Optional: Include if there are additional properties you want to allow
}

/**
 * Uploads a file to Cloudinary using a readable stream.
 * @param fileBuffer - File buffer to upload.
 * @param folder - Cloudinary folder for storing the file.
 * @returns Cloudinary upload result.
 */
export const optimizedUploadToCloudinary = async (
  fileBuffer: Buffer,
  folder: string
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "raw" },
      (error, result) => {
        if (error) {
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
        } else {
          resolve(result as CloudinaryUploadResult); // Explicitly cast result
        }
      }
    );

    const readableStream = new Readable();
    readableStream.push(fileBuffer);
    readableStream.push(null); // Signals the end of the stream
    readableStream.pipe(stream);
  });
};
