export const SOCKET_EVENTS = {
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  CONNECT_ERROR: "connect_error",

  SEND_MESSAGE: "send-message",
  MESSAGE_SENT: "message-sent",
  RECEIVE_MESSAGE: "receive-message",

  TYPING: "typing",
  STOP_TYPING: "stop-typing",

  USER_TYPING: "user-typing",
  USER_STOP_TYPING: "user-stop-typing",

  ONLINE_USERS: "online-users",

  MESSAGE_DELIVERED: "message-delivered",
  MESSAGE_SEEN: "message-seen",

  EDIT_MESSAGE: "edit-message",
  MESSAGE_EDITED: "message-edited",

  DELETE_MESSAGE: "delete-message",
  MESSAGE_DELETED: "message-deleted",

  MESSAGE_ERROR: "message-error",

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

  CALL_ERROR: "call-error",
};
