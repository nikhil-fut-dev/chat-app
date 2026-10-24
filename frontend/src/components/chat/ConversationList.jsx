import Loader from "../common/Loader";
import EmptyConversations from "./EmptyConversations";
import ConversationItem from "./ConversationItem";

export default function ConversationList({
  conversations = [],
  loading = false,
}) {
  if (loading) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!conversations.length) {
    return <EmptyConversations />;
  }

  return (
    <div className="space-y-1" aria-label="Conversations">
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation.conversationId}
          conversation={conversation}
        />
      ))}
    </div>
  );
}
