import {
  MEDIA_LIMITS,
  MEDIA_MIME_TYPES,
} from "../constants/media.constants.js";

export const validateMediaFile = (file) => {
  if (!file) {
    return {
      valid: false,
      message: "Please select an image or video.",
    };
  }

  const isImage = MEDIA_MIME_TYPES.IMAGE.includes(file.mimetype);
  const isVideo = MEDIA_MIME_TYPES.VIDEO.includes(file.mimetype);

  if (!isImage && !isVideo) {
    return {
      valid: false,
      message: "Only JPG, PNG, WEBP, GIF, MP4, WEBM and MOV are allowed.",
    };
  }

  const maxSize = isImage
    ? MEDIA_LIMITS.IMAGE_SIZE_BYTES
    : MEDIA_LIMITS.VIDEO_SIZE_BYTES;

  if (file.size > maxSize) {
    return {
      valid: false,
      message: isImage
        ? "Images cannot exceed 10 MB."
        : "Videos cannot exceed 100 MB.",
    };
  }

  return {
    valid: true,
    message: null,
    mediaType: isImage ? "image" : "video",
  };
};
