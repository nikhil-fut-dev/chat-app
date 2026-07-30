import { Check, CheckCheck } from "lucide-react";

export default function MessageStatus({ message }) {
  if (!message) return null;

  if (message.isSeen) {
    return <CheckCheck size={15} strokeWidth={2.5} className="text-sky-400" />;
  }

  if (message.isDelivered) {
    return (
      <CheckCheck size={15} strokeWidth={2.5} className="text-slate-400" />
    );
  }

  return <Check size={15} strokeWidth={2.5} className="text-slate-500" />;
}
