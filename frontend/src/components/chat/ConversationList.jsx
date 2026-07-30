import Loader from "../common/Loader";
import EmptyConversations from "./EmptyConversations";
import ConversationItem from "./ConversationItem";

export default function ConversationList({ conversations, loading }) {
  if (loading) {
    return <Loader />;
  }

  if (!conversations.length) {
    return <EmptyConversations />;
  }

  return (
    <div className="space-y-1">
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation.conversationId}
          conversation={conversation}
        />
      ))}
    </div>
  );
}
