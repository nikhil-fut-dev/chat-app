import mongoose from "mongoose";
import User from "../../models/User.js";
import {
  findConversation,
  createConversation,
  updateLastMessage,
} from "../../repositories/conversation.repository.js";
import { createMessage } from "../../repositories/message.repository.js";
import { uploadMediaService } from "./media.service.js";

import Message from "../../models/Message.js";

export const createMediaMessageService = async ({
  senderId,
  receiverId,
  caption = "",
  file,
}) => {
  if (!receiverId || !mongoose.Types.ObjectId.isValid(receiverId)) {
    const error = new Error("Invalid receiver ID.");
    error.statusCode = 400;
    throw error;
  }

  if (senderId.toString() === receiverId.toString()) {
    const error = new Error("You cannot send media to yourself.");
    error.statusCode = 400;
    throw error;
  }

  if (typeof caption !== "string") {
    const error = new Error("Caption must be text.");
    error.statusCode = 400;
    throw error;
  }

  const normalizedCaption = caption.trim();

  if (normalizedCaption.length > 2000) {
    const error = new Error("Caption cannot exceed 2000 characters.");
    error.statusCode = 400;
    throw error;
  }

  if (!file) {
    const error = new Error("Please select an image or video.");
    error.statusCode = 400;
    throw error;
  }

  // Confirm the recipient exists before uploading anything.
  const receiver = await User.findById(receiverId).select("_id");

  if (!receiver) {
    const error = new Error("Recipient not found.");
    error.statusCode = 404;
    throw error;
  }

  // Validate and upload the file to Cloudinary.
  const media = await uploadMediaService(file);

  let conversation = await findConversation(senderId, receiverId);

  if (!conversation) {
    conversation = await createConversation([senderId, receiverId]);
  }

  const message = await createMessage({
    conversation: conversation._id,
    sender: senderId,
    receiver: receiverId,
    text: normalizedCaption,
    messageType: media.mediaType,
    attachments: [
      {
        url: media.url,
        publicId: media.publicId,
        fileName: media.fileName,
        fileSize: media.fileSize,
        mimeType: media.mimeType,
      },
    ],
  });

  await updateLastMessage(conversation._id, message._id);

  // Return the populated shape expected by the chat UI.
  return Message.findById(message._id)
    .populate("sender", "fullName username avatar")
    .populate("receiver", "fullName username avatar");
};
