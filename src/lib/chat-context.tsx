import { useNavigate, useRouterState } from "@tanstack/react-router";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useParking } from "./parking-context";
import {
  nextArrival,
  respond,
  startingPrompts,
  type ChatAction,
  type ChatReply,
  type ChatScope,
  type ChatSnapshot,
} from "./chat-engine";

export type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
  time: string;
  actions?: ChatAction[] | undefined;
};

type ChatContext = {
  scope: ChatScope;
  open: boolean;
  busy: boolean;
  messages: ChatMessage[];
  pendingSlot?: string | undefined;
  suggestions: string[];
  show: () => void;
  hide: () => void;
  toggle: () => void;
  send: (question: string) => void;
  runAction: (action: ChatAction) => void;
  reset: () => void;
};

const Context = createContext<ChatContext | null>(null);

const REPLY_DELAY = 420;

function stamp(): string {
  return new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function greetingFor(scope: ChatScope): string {
  if (scope === "landing") {
    return "Hi, I am the SmartPark assistant. Ask me about live availability, how pricing works, or what the hardware needs.";
  }
  if (scope === "driver") {
    return "Hi, I am the SmartPark assistant. Tell me how long you need to park and I will find you a bay and the fee.";
  }
  return "Hi, I am the SmartPark assistant. I read the live floor, so ask me about occupancy, a specific bay, pricing or recent activity.";
}

function scopeFromPath(pathname: string): ChatScope {
  if (pathname === "/") return "landing";
  if (pathname.startsWith("/driver")) return "driver";
  return "operator";
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const parking = useParking();
  const { reserveSlot } = parking;

  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pendingSlot, setPendingSlot] = useState<string | undefined>();
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    { id: "welcome", role: "assistant", text: greetingFor(scopeFromPath(pathname)), time: stamp() },
  ]);

  const scope = scopeFromPath(pathname);
  const latest = useRef({ scope, parking, pendingSlot });
  latest.current = { scope, parking, pendingSlot };
  const counter = useRef(messages.length);

  const show = useCallback(() => setOpen(true), []);
  const hide = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((value) => !value), []);

  const push = useCallback(
    (reply: ChatReply) => {
      const park = latest.current.parking;
      if (reply.pending !== undefined) setPendingSlot(reply.pending ?? undefined);
      if (reply.commit) {
        reserveSlot(reply.commit, park.vehicles[0]?.plate ?? "Unassigned", nextArrival());
      }
      counter.current += 1;
      setMessages((previous) => [
        ...previous,
        {
          id: `assistant-${counter.current}`,
          role: "assistant",
          text: reply.text,
          time: stamp(),
          actions: reply.actions,
        },
      ]);
    },
    [reserveSlot],
  );

  const send = useCallback(
    (raw: string) => {
      const question = raw.trim();
      if (!question) return;

      const current = latest.current;
      const reply = respond(question, {
        scope: current.scope,
        slots: current.parking.slots,
        vehicles: current.parking.vehicles,
        events: current.parking.events,
        firstHour: current.parking.firstHour,
        extraHour: current.parking.extraHour,
        dailyMax: current.parking.dailyMax,
        pendingSlot: current.pendingSlot,
      });

      counter.current += 1;
      setMessages((previous) => [
        ...previous,
        { id: `user-${counter.current}`, role: "user", text: question, time: stamp() },
      ]);
      setBusy(true);

      window.setTimeout(() => {
        push(reply);
        setBusy(false);
      }, REPLY_DELAY);
    },
    [push],
  );

  const runAction = useCallback(
    (action: ChatAction) => {
      if (action.kind === "navigate") {
        setOpen(false);
        void navigate({ to: action.to });
        return;
      }
      send(action.question);
    },
    [navigate, send],
  );

  const reset = useCallback(() => {
    counter.current = 1;
    setPendingSlot(undefined);
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        text: greetingFor(scopeFromPath(pathname)),
        time: stamp(),
      },
    ]);
  }, [pathname]);

  const value = useMemo<ChatContext>(
    () => ({
      scope,
      open,
      busy,
      messages,
      pendingSlot,
      suggestions: startingPrompts(scope),
      show,
      hide,
      toggle,
      send,
      runAction,
      reset,
    }),
    [scope, open, busy, messages, pendingSlot, show, hide, toggle, send, runAction, reset],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useChat(): ChatContext {
  const context = useContext(Context);
  if (!context) throw new Error("ChatProvider is missing");
  return context;
}
