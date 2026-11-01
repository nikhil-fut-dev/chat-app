import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { createMediaMessageService } from "../services/mediaMessage.service.js";
import { getIO } from "../../sockets/index.js";

export const sendMediaMessage = asyncHandler(async (req, res) => {
  console.log("[Media Controller] Content-Type:", req.headers["content-type"]);
  console.log("[Media Controller] Body:", req.body);
  console.log("[Media Controller] File:", req.file);
  const { receiverId, caption = "" } = req.body;

  if (!receiverId) {
    return res
      .status(400)
      .json(new ApiResponse(400, "Receiver ID is required."));
  }

  const message = await createMediaMessageService({
    senderId: req.user._id,
    receiverId,
    caption,
    file: req.file,
  });

  const io = getIO();

  if (io) {
    io.to(req.user._id.toString()).emit("message-sent", message);
    io.to(receiverId.toString()).emit("receive-message", message);
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "Media message sent successfully", message));
});
