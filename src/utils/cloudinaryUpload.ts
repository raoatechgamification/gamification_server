import cloudinary from '../config/cloudinary.config'; 

export const uploadToCloudinary = async (fileBuffer: Buffer, mimetype: string, folder: string) => {
  try {
    const fileBase64 = `data:${mimetype};base64,${fileBuffer.toString('base64')}`;
    const result = await cloudinary.uploader.upload(fileBase64, {
      folder, 
      resource_type: "auto"
    });
    return result;
  } catch (error: any) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};
