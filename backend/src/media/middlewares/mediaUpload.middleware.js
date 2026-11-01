import multer from "multer";
import {
  MEDIA_LIMITS,
  MEDIA_MIME_TYPES,
} from "../constants/media.constants.js";

const storage = multer.memoryStorage();

const allowedMimeTypes = [...MEDIA_MIME_TYPES.IMAGE, ...MEDIA_MIME_TYPES.VIDEO];

const fileFilter = (req, file, callback) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    const error = new Error(
      "Unsupported file type. Please upload an image or video.",
    );

    error.statusCode = 400;
    return callback(error);
  }

  callback(null, true);
};

const limits = {
  fileSize: MEDIA_LIMITS.VIDEO_SIZE_BYTES,
  files: 1,
};

const upload = multer({
  storage,
  fileFilter,
  limits,
});

export const uploadMediaFile = (req, res, next) => {
  upload.single("file")(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
          success: false,
          message: "The selected file exceeds the 100 MB upload limit.",
        });
      }

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "File upload validation failed.",
    });
  });
};
