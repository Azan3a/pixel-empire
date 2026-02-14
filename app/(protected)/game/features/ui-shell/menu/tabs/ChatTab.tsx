// game/features/ui-shell/menu/tabs/ChatTab.tsx
"use client";

import { useChat } from "./use-chat";

interface ChatTabProps {
  playerName: string;
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function MessageBubble({
  msg,
  currentPlayerName,
}: {
  msg: {
    _id: string;
    playerName: string;
    message: string;
    type: "chat" | "system" | "activity";
    sentAt: number;
  };
  currentPlayerName: string;
}) {
  const isOwn = msg.playerName === currentPlayerName;

  if (msg.type === "system") {
    return (
      <div className="flex justify-center py-1">
        <span className="text-xs text-muted-foreground/60 italic bg-muted/50 rounded-full px-3 py-0.5">
          ⚙️ {msg.message}
        </span>
      </div>
    );
  }

  if (msg.type === "activity") {
    return (
      <div className="flex justify-center py-1">
        <span className="text-xs text-amber-500/80 italic bg-amber-500/10 rounded-full px-3 py-0.5">
          🎮 <span className="font-semibold">{msg.playerName}</span>{" "}
          {msg.message}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
      <div className="flex items-center gap-1.5 mb-0.5 px-1">
        <span className="text-[10px] font-semibold text-muted-foreground/70">
          {isOwn ? "You" : msg.playerName}
        </span>
        <span className="text-[10px] text-muted-foreground/40">
          {formatTime(msg.sentAt)}
        </span>
      </div>
      <div
        className={`max-w-[80%] rounded-2xl px-3 py-1.5 text-sm wrap-break-word ${
          isOwn
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-muted rounded-bl-md"
        }`}
      >
        {msg.message}
      </div>
    </div>
  );
}

export function ChatTab({ playerName }: ChatTabProps) {
  const {
    messages,
    draft,
    setDraft,
    sendMessage,
    handleKeyDown,
    isSending,
    scrollRef,
  } = useChat();

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-lg font-bold mb-1">Chat & Activity Log</h3>
      <p className="text-sm text-muted-foreground mb-3">
        Messages auto-expire after 1 hour.
      </p>

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 bg-muted/30 rounded-xl p-3 overflow-y-auto min-h-0 space-y-2"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground/50 text-sm">
            <span className="text-2xl mb-2">💬</span>
            <p>No messages yet.</p>
            <p className="text-xs">Be the first to say something!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg._id}
              msg={msg}
              currentPlayerName={playerName}
            />
          ))
        )}
      </div>

      {/* Input area */}
      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          maxLength={280}
          disabled={isSending}
          className="flex-1 rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 placeholder:text-muted-foreground/50"
        />
        <button
          onClick={sendMessage}
          disabled={isSending || !draft.trim()}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isSending ? "..." : "Send"}
        </button>
      </div>

      {/* Footer info */}
      <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground/50 px-1">
        <span>
          {messages.length} message{messages.length !== 1 ? "s" : ""}
        </span>
        <span>{draft.length}/280</span>
      </div>
    </div>
  );
}
