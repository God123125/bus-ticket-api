import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import "dotenv/config";
// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// Multer config (memory storage for buffer)
export const upload = multer({ storage: multer.memoryStorage() });

// Upload helper function
export const uploadToCloudinary = (
  buffer: Buffer,
  folder: string,
): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result!.secure_url,
          publicId: result!.public_id,
        });
      },
    );
    stream.end(buffer);
  });
};

// Delete helper function
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId);
};
