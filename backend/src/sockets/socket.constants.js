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

  // Audio / Video Calling
  CALL_INITIATE: "call-initiate",
  CALL_INCOMING: "call-incoming",
  CALL_RINGING: "call-ringing",
  CALL_ACCEPT: "call-accept",
  CALL_ACCEPTED: "call-accepted",
  CALL_REJECT: "call-reject",
  CALL_REJECTED: "call-rejected",
  CALL_END: "call-end",
  CALL_ENDED: "call-ended",

  // WebRTC Signaling
  CALL_OFFER: "call-offer",
  CALL_ANSWER: "call-answer",
  CALL_ICE_CANDIDATE: "call-ice-candidate",

  // Call errors
  CALL_ERROR: "call-error",
};
