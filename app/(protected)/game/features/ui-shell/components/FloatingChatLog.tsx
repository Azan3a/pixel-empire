// game/features/ui-shell/components/FloatingChatLog.tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useRef, useState } from "react";

const AUTO_HIDE_MS = 15_000; // 15 seconds
// Roughly how many text lines we allow before we stop adding older messages.
const MAX_VISIBLE_LINES = 10;

function estimateLines(text: string): number {
  // Very rough: split on newlines + wrap estimation
  const base = text.split("\n").length;
  const wrapped = Math.ceil(text.length / 60); // assume ~60 chars per line at this font size
  return Math.max(base, wrapped);
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });
}

function MessageLine({
  msg,
}: {
  msg: {
    playerName: string;
    message: string;
    type: "chat" | "system" | "activity";
    sentAt: number;
  };
}) {
  if (msg.type === "system") {
    return (
      <p className="leading-tight">
        <span className="opacity-40 mr-1">[{formatTime(msg.sentAt)}]</span>
        <span className="text-yellow-400/70 italic">⚙ {msg.message}</span>
      </p>
    );
  }

  if (msg.type === "activity") {
    return (
      <p className="leading-tight">
        <span className="opacity-40 mr-1">[{formatTime(msg.sentAt)}]</span>
        <span className="text-amber-300/70">
          <span className="font-semibold">{msg.playerName}</span> {msg.message}
        </span>
      </p>
    );
  }

  return (
    <p className="leading-tight">
      <span className="opacity-40 mr-1">[{formatTime(msg.sentAt)}]</span>
      <span className="font-semibold text-white/90">{msg.playerName}</span>
      <span className="opacity-50 mx-0.5">:</span>
      <span className="text-white/75">{msg.message}</span>
    </p>
  );
}

export function FloatingChatLog() {
  const messages = useQuery(api.chat.listRecent) ?? [];
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Get the last message to track changes
  const lastMessage = messages[messages.length - 1];
  const lastMessageId = lastMessage?._id;

  const recentMessages = messages.slice(-20);

  // Determine which messages to show so we never show a partial message.
  const visibleMessages: typeof recentMessages = [];
  let accumulatedLines = 0;

  for (const msg of [...recentMessages].reverse()) {
    const lines = 1 + estimateLines(msg.message); // +1 for name/timestamp row
    if (accumulatedLines + lines > MAX_VISIBLE_LINES) break;
    visibleMessages.unshift(msg);
    accumulatedLines += lines;
  }

  // When the latest message ID changes, show the chat, then hide it after delay
  useEffect(() => {
    if (!lastMessageId) return;

    // Optional: Only show if the message is actually recent (e.g. < 1 min old)
    // This prevents the chat from popping up when you first load the page if the last message was hours ago.
    const isRecent = Date.now() - lastMessage.sentAt < 60000;
    if (!isRecent) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsVisible(true);

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, AUTO_HIDE_MS);

    return () => clearTimeout(timer);
  }, [lastMessageId, lastMessage?.sentAt]);

  // Auto-scroll to bottom whenever visible messages update
  useEffect(() => {
    if (scrollRef.current && isVisible) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleMessages.length, isVisible]);

  if (!isVisible || visibleMessages.length === 0) return null;

  return (
    <div className="absolute bottom-4 left-4 z-30 pointer-events-none select-none">
      <div
        ref={scrollRef}
        className="max-w-120 max-h-36 overflow-y-auto rounded-sm bg-black/40 backdrop-blur-sm px-2.5 py-2 animate-in fade-in zoom-in-95 duration-300 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
      >
        <div className="space-y-0.5 text-[11px] font-mono text-white/80">
          {visibleMessages.map((msg) => (
            <MessageLine key={msg._id} msg={msg} />
          ))}
        </div>
      </div>
    </div>
  );
}
