import { Bot, CornerDownLeft, MessageSquareText, RotateCcw, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "./Button";
import { useChat, type ChatMessage } from "@/lib/chat-context";
import { cn } from "@/lib/utils";

const scopeLabels = {
  landing: "SmartPark",
  operator: "Operator console",
  driver: "Driver view",
} as const;

/** Header entry point that opens the same panel as the floating launcher. */
export function ChatTrigger({ className }: { className?: string }) {
  const { open, toggle } = useChat();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={open ? "Close SmartPark assistant" : "Open SmartPark assistant"}
      aria-expanded={open}
      title="SmartPark assistant"
      className={cn(
        "flex size-9 items-center justify-center rounded-md transition-colors hover:bg-muted hover:text-foreground",
        open
          ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
          : "text-muted-foreground",
        className,
      )}
    >
      <MessageSquareText size={18} />
    </button>
  );
}

function Bubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-2.5", isUser && "justify-end")}>
      {!isUser && (
        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Bot size={15} />
        </span>
      )}
      <div className={cn("min-w-0 max-w-[85%]", isUser && "flex flex-col items-end")}>
        <div
          className={cn(
            "px-3.5 py-2.5 text-sm leading-relaxed",
            isUser
              ? "rounded-lg rounded-tr-sm bg-primary text-primary-foreground"
              : "rounded-lg rounded-tl-sm border border-border bg-canvas text-foreground",
          )}
        >
          {message.text}
        </div>
        <time className="mt-1 px-1 font-mono text-[10px] tabular-nums text-muted-foreground">
          {message.time}
        </time>
      </div>
    </div>
  );
}

export function ChatWidget() {
  const {
    scope,
    open,
    busy,
    messages,
    pendingSlot,
    suggestions,
    hide,
    toggle,
    send,
    runAction,
    reset,
  } = useChat();
  const [draft, setDraft] = useState("");
  const scroller = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  // Keep the newest message in view as the conversation grows.
  useEffect(() => {
    const node = scroller.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, busy]);

  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") hide();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, hide]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!draft.trim() || busy) return;
    send(draft);
    setDraft("");
  }

  if (!open) {
    return (
      <Button
        onClick={toggle}
        aria-label="Open SmartPark assistant"
        aria-expanded={false}
        className={cn(
          "fixed right-5 z-40 size-13 !p-0 rounded-full shadow-xl shadow-ink/20",
          scope === "driver" ? "bottom-24" : "bottom-6",
        )}
      >
        <MessageSquareText size={22} />
      </Button>
    );
  }

  return (
    <div
      role="dialog"
      aria-label="SmartPark assistant"
      className="fixed inset-x-3 bottom-3 z-50 flex h-[min(560px,calc(100vh-4rem))] flex-col overflow-hidden rounded-lg border border-border bg-card shadow-2xl sm:inset-x-auto sm:right-5 sm:bottom-6 sm:h-[560px] sm:w-[380px]"
    >
      <header className="flex shrink-0 items-center gap-3 bg-ink px-4 py-3.5 text-primary-foreground">
        <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Sparkles size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-sm font-bold">SmartPark assistant</div>
          <div className="flex items-center gap-1.5 text-[11px] text-primary-foreground/55">
            <span className="size-1.5 shrink-0 rounded-full bg-success status-pulse" />
            {scopeLabels[scope]}
          </div>
        </div>
        <button
          type="button"
          onClick={reset}
          aria-label="Start a new conversation"
          title="New conversation"
          className="flex size-8 items-center justify-center rounded-md text-primary-foreground/60 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
        >
          <RotateCcw size={16} />
        </button>
        <button
          type="button"
          onClick={hide}
          aria-label="Close assistant"
          className="flex size-8 items-center justify-center rounded-md text-primary-foreground/60 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
        >
          <X size={17} />
        </button>
      </header>

      <div
        ref={scroller}
        role="log"
        aria-live="polite"
        className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4"
      >
        {messages.map((message) => (
          <div key={message.id} className="space-y-2">
            <Bubble message={message} />
            {message.actions && message.actions.length > 0 && (
              <div className="flex flex-wrap gap-2 pl-9.5">
                {message.actions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => runAction(action)}
                    className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {busy && (
          <div className="flex gap-2.5" aria-live="assertive">
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Bot size={15} />
            </span>
            <span className="flex items-center gap-1 rounded-lg rounded-tl-sm border border-border bg-canvas px-3.5 py-3">
              <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-.3s]" />
              <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-.15s]" />
              <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground" />
              <span className="sr-only">Assistant is typing</span>
            </span>
          </div>
        )}

        {pendingSlot && (
          <div className="flex items-center gap-2 rounded-md bg-warning-soft px-3 py-2 text-xs font-semibold text-warning">
            <Sparkles size={14} /> Holding {pendingSlot} — ask me to confirm or cancel
          </div>
        )}
      </div>

      {messages.length <= 1 && !busy && (
        <div className="shrink-0 border-t border-border px-4 py-3">
          <div className="flex flex-wrap gap-2">
            {suggestions.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => send(question)}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={submit} className="shrink-0 border-t border-border p-3">
        <div className="flex items-center gap-2">
          <label htmlFor="chat-input" className="sr-only">
            Message the SmartPark assistant
          </label>
          <input
            id="chat-input"
            ref={input}
            value={draft}
            maxLength={240}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Ask about bays, fees or activity…"
            autoComplete="off"
            className="surface-input h-10 min-w-0 flex-1 px-3 text-sm"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!draft.trim() || busy}
            aria-label="Send message"
          >
            <CornerDownLeft size={16} />
          </Button>
        </div>
        <p className="mt-2 text-center text-[10px] text-muted-foreground">
          Demo assistant — answers come from the sample facility data.
        </p>
      </form>
    </div>
  );
}
