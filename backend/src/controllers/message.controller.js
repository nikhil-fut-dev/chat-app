import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
  sendMessageService,
  getMessagesService,
  markDeliveredService,
  markSeenService,
  editMessageService,
  deleteMessageService,
} from "../services/message.service.js";

export const sendMessage = asyncHandler(async (req, res) => {
  const senderId = req.user._id;

  const { receiverId, text } = req.body;

  const message = await sendMessageService({
    senderId,
    receiverId,
    text,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Message sent successfully", message));
});

export const getMessages = asyncHandler(async (req, res) => {
  const senderId = req.user._id;

  const { receiverId } = req.params;

  const messages = await getMessagesService(senderId, receiverId);

  return res
    .status(200)
    .json(new ApiResponse(200, "Messages fetched successfully", messages));
});

export const markDelivered = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  const message = await markDeliveredService(messageId);

  return res
    .status(200)
    .json(new ApiResponse(200, "Message delivered", message));
});

export const markSeen = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  const message = await markSeenService(messageId);

  return res.status(200).json(new ApiResponse(200, "Message seen", message));
});

export const editMessage = asyncHandler(async (req, res) => {
  const message = await editMessageService(
    req.params.id,
    req.user._id,
    req.body.text,
  );

  res
    .status(200)
    .json(new ApiResponse(200, "Message updated successfully", message));
});

export const deleteMessage = asyncHandler(async (req, res) => {
  const message = await deleteMessageService(req.params.id, req.user._id);

  res
    .status(200)
    .json(new ApiResponse(200, "Message deleted successfully", message));
});
