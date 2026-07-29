import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import uploadToCloudinary from "../utils/uploadToCloudinary.js";

export const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      message: "No file uploaded",
    });
  }

  const result = await uploadToCloudinary(req.file.buffer, "chat-app");

  res
    .status(200)
    .json(new ApiResponse(200, "File uploaded successfully", result));
});
