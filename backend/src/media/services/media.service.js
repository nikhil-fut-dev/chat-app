import cloudinary from "../../config/cloudinary.js";
import uploadToCloudinary from "../../utils/uploadToCloudinary.js";
import { validateMediaFile } from "../validators/media.validator.js";

export const uploadMediaService = async (file) => {
  const validation = validateMediaFile(file);

  if (!validation.valid) {
    const error = new Error(validation.message);
    error.statusCode = 400;
    throw error;
  }

  const resourceType = validation.mediaType === "video" ? "video" : "image";

  const result = await uploadToCloudinary(
    file.buffer,
    "chat-app/media",
    resourceType,
  );

  return {
    url: result.secure_url,
    publicId: result.public_id,
    fileName: file.originalname,
    fileSize: file.size,
    mimeType: file.mimetype,
    resourceType,
    mediaType: validation.mediaType,
  };
};
