import { Check, CheckCheck } from "lucide-react";

export default function MessageStatus({ message }) {
  if (!message) return null;

  // Seen: double green/blue ticks
  if (message.isSeen) {
    return (
      <CheckCheck
        size={15}
        strokeWidth={2.5}
        className="text-sky-300"
        aria-label="Seen"
        title="Seen"
      />
    );
  }

  // Delivered: double muted ticks
  if (message.isDelivered) {
    return (
      <CheckCheck
        size={15}
        strokeWidth={2.5}
        className="text-emerald-100"
        aria-label="Delivered"
        title="Delivered"
      />
    );
  }

  // Sent: single tick
  return (
    <Check
      size={15}
      strokeWidth={2.5}
      className="text-emerald-100"
      aria-label="Sent"
      title="Sent"
    />
  );
}
