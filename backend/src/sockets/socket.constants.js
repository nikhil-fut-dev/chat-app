export const SOCKET_EVENTS = {
  CONNECTION: "connection",
  DISCONNECT: "disconnect",

  JOIN: "join",
  LEAVE: "leave",

  SEND_MESSAGE: "send_message",
  RECEIVE_MESSAGE: "receive_message",

  GET_MESSAGES: "get_messages",
  MESSAGE_HISTORY: "message_history",

  TYPING: "typing",
  STOP_TYPING: "stop_typing",

  USER_TYPING: "user_typing",
  USER_STOPPED_TYPING: "user_stopped_typing",

  USER_ONLINE: "user_online",
  USER_OFFLINE: "user_offline",

  MESSAGE_DELIVERED: "message_delivered",
  MESSAGE_SEEN: "message_seen",

  DELIVER_MESSAGE: "deliver_message",
  SEEN_MESSAGE: "seen_message",
};
