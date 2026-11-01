import API from "./axios";

export const getMessages = async (receiverId) => {
  const response = await API.get(`/messages/${receiverId}`);

  return response.data;
};

export const sendMessage = async ({ receiverId, text }) => {
  const response = await API.post("/messages", {
    receiverId,
    text,
  });

  return response.data;
};

export const markMessageDelivered = async (messageId) => {
  const response = await API.patch(`/messages/${messageId}/delivered`);

  return response.data;
};

export const markMessageSeen = async (messageId) => {
  const response = await API.patch(`/messages/${messageId}/seen`);

  return response.data;
};

export const editMessage = async (messageId, text) => {
  const response = await API.put(`/messages/${messageId}`, {
    text,
  });

  return response.data;
};

export const deleteMessage = async (messageId) => {
  const response = await API.delete(`/messages/${messageId}`);

  return response.data;
};

export const sendMediaMessage = async ({
  receiverId,
  caption = "",
  file,
  onUploadProgress,
  signal,
}) => {
  const formData = new FormData();

  formData.append("receiverId", receiverId);
  formData.append("caption", caption);
  formData.append("file", file);

  // Temporary debugging
  console.log("[Media API] Request details:", {
    receiverId,
    caption,
    fileName: file?.name,
    fileType: file?.type,
    fileSize: file?.size,
  });

  try {
    const response = await API.post("/media/messages", formData, {
      onUploadProgress: (event) => {
        if (!event.total || !onUploadProgress) return;

        const progress = Math.round((event.loaded * 100) / event.total);

        onUploadProgress(progress);
      },
      signal,
    });

    console.log("[Media API] Success:", response.data);

    return response.data;
  } catch (error) {
    console.error("[Media API] Status:", error.response?.status);
    console.error("[Media API] Response:", error.response?.data);
    console.error("[Media API] Error:", error.message);

    throw error;
  }
};
