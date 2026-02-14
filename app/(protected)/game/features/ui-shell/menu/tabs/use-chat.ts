// game/features/ui-shell/menu/tabs/use-chat.ts
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useCallback, useRef, useEffect } from "react";

export function useChat() {
  const messages = useQuery(api.chat.listRecent) ?? [];
  const sendMessageMutation = useMutation(api.chat.sendMessage);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const sendMessage = useCallback(async () => {
    const trimmed = draft.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    try {
      await sendMessageMutation({ message: trimmed });
      setDraft("");
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setIsSending(false);
    }
  }, [draft, isSending, sendMessageMutation]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage],
  );

  return {
    messages,
    draft,
    setDraft,
    sendMessage,
    handleKeyDown,
    isSending,
    scrollRef,
  };
}
