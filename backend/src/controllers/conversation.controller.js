import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import { getConversationListService } from "../services/conversation.service.js";

export const getConversations = asyncHandler(async (req, res) => {
  const conversations = await getConversationListService(req.user._id);

  res
    .status(200)
    .json(
      new ApiResponse(200, "Conversations fetched successfully", conversations),
    );
});
