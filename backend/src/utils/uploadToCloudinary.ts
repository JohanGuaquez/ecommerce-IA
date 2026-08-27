import { UploadApiResponse } from "cloudinary";
import cloudinary from "../config/cloudinary";

export const uploadBufferToCloudinary = (
  buffer: Buffer,
  folder = "ecommerce/products",
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        if (!result) {
          return reject(new Error("No se pudo subir la imagen a Cloudinary"));
        }

        resolve(result);
      },
    );

    uploadStream.end(buffer);
  });
};
