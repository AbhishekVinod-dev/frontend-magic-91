import type { Event, Slot, Vehicle } from "./parking-context";

/** Part of the app the assistant is answering from. */
export type ChatScope = "landing" | "operator" | "driver";

export type ChatAction =
  | { kind: "ask"; label: string; question: string }
  | { kind: "navigate"; label: string; to: string };

export type ChatReply = {
  intent: string;
  text: string;
  actions?: ChatAction[] | undefined;
  /** Bay id to hold while the visitor confirms, or null to release a held bay. */
  pending?: string | null | undefined;
  /** Bay id to reserve straight away with the default vehicle and arrival time. */
  commit?: string | undefined;
};

export type ChatSnapshot = {
  scope: ChatScope;
  slots: Slot[];
  vehicles: Vehicle[];
  events: Event[];
  firstHour: number;
  extraHour: number;
  dailyMax: number;
  /** Bay waiting for the visitor to confirm a reservation. */
  pendingSlot?: string | undefined;
};

/** Sample facility figures that mirror the operator dashboard copy. */
const FACILITY = {
  sensorsOnline: 10,
  sensorsTotal: 10,
  activeSessions: 2,
  entriesToday: 27,
  exitsToday: 25,
  revenueToday: 12450,
  setupMinutes: 60,
  gateSeconds: 0.9,
};

const STATUS_LABEL: Record<Slot["status"], string> = {
  available: "available",
  occupied: "occupied",
  reserved: "reserved for a driver",
  maintenance: "out of service",
};

const STATUS_TEST: Record<Slot["status"], RegExp> = {
  available: /available|free|vacant|empty|open/,
  occupied: /occupied|taken|busy|full|parked/,
  reserved: /reserved|held|blocked/,
  maintenance: /maintenance|service|repair|broken|out of service|offline/,
};

const ASKS_ABOUT_SPACE = /\b(free|available|vacant|empty|open)\b/;

const DESTINATIONS = [
  { to: "/overview", label: "Overview", match: /overview|dashboard|control cent|home screen/ },
  {
    to: "/parking",
    label: "parking map",
    match: /parking map|floor ?plan|layout|\bmap\b|bays? on/,
  },
  { to: "/sessions", label: "Sessions", match: /session|activity|entr(y|ies)|log/ },
  { to: "/vehicles", label: "Vehicles", match: /vehicle|plate|registered car|saved car/ },
  { to: "/analytics", label: "Analytics", match: /analytic|revenue|trend|peak hour|report/ },
  { to: "/devices", label: "Devices", match: /device|sensor|hardware|controller|gate status/ },
  { to: "/settings", label: "Settings", match: /setting|configur/ },
  { to: "/driver", label: "driver view", match: /driver (view|app|page)|driver side/ },
] as const;

const NAVIGATE_TRIGGER =
  /\b(open|show|take me|go to|switch to|jump to|where can i find|find the|navigate)\b/;

/** Questions offered as tappable chips when the panel first opens. */
export function startingPrompts(scope: ChatScope): string[] {
  if (scope === "driver") {
    return [
      "Which bays are free?",
      "What will 3 hours cost?",
      "Reserve a space",
      "Show my vehicles",
    ];
  }
  if (scope === "landing") {
    return [
      "What does SmartPark do?",
      "How does pricing work?",
      "How do I set up the hardware?",
      "Talk to sales",
    ];
  }
  return [
    "How many spaces are free?",
    "Is any bay under maintenance?",
    "Show recent activity",
    "Open the parking map",
  ];
}

export function freeSlots(slots: Slot[]): Slot[] {
  return slots.filter((slot) => slot.status === "available");
}

export function countSlots(slots: Slot[], status: Slot["status"]): number {
  return slots.filter((slot) => slot.status === status).length;
}

export function occupancyRate(slots: Slot[]): number {
  return slots.length ? Math.round((countSlots(slots, "occupied") / slots.length) * 100) : 0;
}

/** Mirrors the driver view: first hour, then each extra hour, capped per day. */
export function estimateFee(
  rates: { firstHour: number; extraHour: number; dailyMax: number },
  hours: number,
): number {
  return Math.min(rates.dailyMax, rates.firstHour + Math.max(0, hours - 1) * rates.extraHour);
}

/** Reads "S03", "slot 3" or "bay 12" into the bay ids this app uses. */
export function parseSlotId(input: string): string | undefined {
  const long = input.match(/\b(?:slot|space|bay|stand|parking)\s*#?\s*0?(\d{1,2})\b/i);
  const short = input.match(/(?:^|[^a-z0-9])s\s*0?(\d{1,2})\b/i);
  const digits = long?.[1] ?? short?.[1];
  return digits ? `S${digits.padStart(2, "0")}` : undefined;
}

/** Reads a duration from "3 hours", "90 min" or "a full day"; defaults to 2. */
export function parseHours(input: string): number {
  const text = input.toLowerCase();
  if (/\bfull day\b|\ball day\b|\b24\s*(h|hr|hour)/.test(text)) return 24;
  if (/\bhalf day\b/.test(text)) return 12;
  const minutes = text.match(/\b(\d{1,3})\s*(?:m|min|mins|minute|minutes)\b/);
  if (minutes) return Math.max(1, Math.round(Number(minutes[1]) / 60));
  const hours = text.match(/\b(\d{1,2})\s*(?:h|hr|hrs|hour|hours)\b/);
  if (hours) return Math.max(1, Number(hours[1]));
  return 2;
}

/** Rounded-up half-hour time of day, shaped for `<input type="time">`. */
export function nextArrival(now = new Date()): string {
  const arrival = new Date(now);
  arrival.setMinutes(Math.ceil((arrival.getMinutes() + 1) / 30) * 30, 0, 0);
  const hours = String(arrival.getHours()).padStart(2, "0");
  const minutes = String(arrival.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function findSlot(slots: Slot[], id: string): Slot | undefined {
  return slots.find((slot) => slot.id.toLowerCase() === id.toLowerCase());
}

function joinList(items: string[], limit = 6): string {
  const shown = items.slice(0, limit);
  const extra = items.length - shown.length;
  const head = shown.length > 1 ? `${shown.slice(0, -1).join(", ")} and ${shown.at(-1)}` : shown[0];
  return extra > 0 ? `${head}, plus ${extra} more` : (head ?? "");
}

function bayIds(slots: Slot[]): string {
  return joinList(slots.map((slot) => slot.id));
}

function freeBayActions(snap: ChatSnapshot): ChatAction[] | undefined {
  const first = freeSlots(snap.slots)[0];
  if (!first || snap.scope === "landing") return undefined;
  return [{ kind: "ask", label: `Reserve ${first.id}`, question: `Reserve ${first.id}` }];
}

function destination(text: string) {
  return DESTINATIONS.find((item) => item.match.test(text));
}

/**
 * Turns a typed question into a grounded reply. Every answer is derived from the
 * shared demo state, so the assistant never invents facility data.
 */
export function respond(input: string, snap: ChatSnapshot): ChatReply {
  const question = input.trim();
  const text = question.toLowerCase();
  const slotId = parseSlotId(question);
  const held = snap.pendingSlot ? findSlot(snap.slots, snap.pendingSlot) : undefined;
  const vehicle = snap.vehicles[0]?.plate ?? "your vehicle";

  if (!question) {
    return {
      intent: "empty",
      text: "Ask me about bays, pricing or anything happening on the floor.",
    };
  }

  // A held bay wins over everything else until the visitor decides.
  if (held && /\b(confirm|yes|yeah|yep|sure|proceed|go ahead|do it|book it)\b/.test(text)) {
    return {
      intent: "confirm-reservation",
      text: `Bay ${held.id} is reserved for ${vehicle} with arrival at ${nextArrival()}. It now shows as reserved on the live map.`,
      commit: held.id,
      pending: null,
    };
  }

  if (held && /^(no|nope|cancel|never ?mind|forget it|abort|stop)\b/.test(text)) {
    return {
      intent: "cancel-reservation",
      text: `No problem — I have released ${held.id}.`,
      pending: null,
    };
  }

  if (/\b(reserv|book|hold)\w*\b/.test(text)) {
    if (!slotId) {
      const free = freeSlots(snap.slots);
      if (!free.length) {
        return {
          intent: "reserve",
          text: `Every bay is taken right now — ${snap.slots.length} in use, ${countSlots(snap.slots, "maintenance")} in maintenance. Reservations usually open up within the hour.`,
          actions: [{ kind: "navigate", label: "Watch the map", to: "/parking" }],
        };
      }
      const first = free[0];
      return {
        intent: "reserve",
        text: `Happy to hold one. Free right now: ${bayIds(free)}. Which bay should I take?`,
        actions: [
          ...(first
            ? [{ kind: "ask" as const, label: `Take ${first.id}`, question: `Reserve ${first.id}` }]
            : []),
          { kind: "ask", label: "Show more bays", question: "Which bays are free?" },
        ],
      };
    }

    const slot = findSlot(snap.slots, slotId);
    if (!slot) {
      return {
        intent: "reserve",
        text: `There is no bay ${slotId} on this floor. The bays run from ${snap.slots[0]?.id ?? "S01"} to ${snap.slots.at(-1)?.id ?? "—"}.`,
      };
    }
    if (slot.status !== "available") {
      return {
        intent: "reserve",
        text: `Bay ${slot.id} is ${STATUS_LABEL[slot.status]}${slot.vehicle ? ` by ${slot.vehicle}` : ""}, so I cannot hold it. Free right now: ${bayIds(freeSlots(snap.slots))}.`,
        actions: freeBayActions(snap),
      };
    }

    const hours = parseHours(question);
    return {
      intent: "reserve",
      text: `Bay ${slot.id} is free. ${hours} ${hours === 1 ? "hour" : "hours"} comes to ₹${estimateFee(snap, hours)}, arriving ${nextArrival()}. Shall I hold it for ${vehicle}?`,
      actions: [
        { kind: "ask", label: `Yes, hold ${slot.id}`, question: "confirm" },
        { kind: "ask", label: "Pick another bay", question: "Which bays are free?" },
      ],
      pending: slot.id,
    };
  }

  if (slotId) {
    const slot = findSlot(snap.slots, slotId);
    if (!slot) {
      return { intent: "slot-status", text: `I cannot find a bay called ${slotId} on this floor.` };
    }
    const status = `Bay ${slot.id} is ${STATUS_LABEL[slot.status]}${slot.vehicle ? ` by ${slot.vehicle}` : ""}.`;
    if (
      slot.status !== "available" &&
      (STATUS_TEST[slot.status].test(text) || ASKS_ABOUT_SPACE.test(text))
    ) {
      return {
        intent: "slot-status",
        text: `${status} Free right now: ${bayIds(freeSlots(snap.slots))}.`,
        actions: freeBayActions(snap),
      };
    }
    return {
      intent: "slot-status",
      text: status,
      actions: slot.status === "available" ? freeBayActions(snap) : undefined,
    };
  }

  if (/\b(maintenance|service|repair|broken|out of service)\b/.test(text)) {
    const offline = snap.slots.filter((slot) => slot.status === "maintenance");
    if (!offline.length) {
      return {
        intent: "maintenance",
        text: "No bays are in maintenance — every other sensor is reporting normally.",
      };
    }
    return {
      intent: "maintenance",
      text: `${offline.length} bay${offline.length === 1 ? " is" : "s are"} out of service: ${bayIds(offline)}. Everything else on the floor is working.`,
      actions: [{ kind: "navigate", label: "Open the parking map", to: "/parking" }],
    };
  }

  if (/\b(hi|hey|hello|yo|namaste|good (morning|afternoon|evening))\b/.test(text)) {
    return {
      intent: "greeting",
      text:
        snap.scope === "landing"
          ? "Hello — I am the SmartPark assistant. Ask me how live availability, pricing or the hardware setup works."
          : `Hello. ${countSlots(snap.slots, "available")} of ${snap.slots.length} bays are free right now. Ask me about a specific bay, fees or recent activity.`,
      actions: freeBayActions(snap),
    };
  }

  if (/\b(thanks|thank you|cheers|perfect|great|awesome|helpful)\b/.test(text)) {
    return { intent: "thanks", text: "Happy to help. Ask me anything else about the floor." };
  }

  if (/\b(help|what can you|capabilit|commands?|how do i use)\b/.test(text)) {
    return {
      intent: "help",
      text: "I answer from live demo data: which bays are free, occupancy, fees for a given number of hours, a specific bay's status, recent activity and hardware health. I can also reserve a bay or open any page for you.",
      actions: startingPrompts(snap.scope)
        .slice(0, 3)
        .map((question) => ({ kind: "ask", label: question, question })),
    };
  }

  if (
    /\b(which|what|list|show me|name)\b.*\b(bays?|slots?|spaces?)\b/.test(text) ||
    /\b(free|available)\s+(bays?|slots?|spaces?)\b/.test(text) ||
    /\b(how many|availability|any (bays?|slots?|spaces?)|space available|free now|open now)\b/.test(
      text,
    )
  ) {
    const free = freeSlots(snap.slots);
    if (!free.length) {
      return {
        intent: "availability",
        text: `No bays are free right now — all ${snap.slots.length} are taken, held or out of service.`,
      };
    }
    return {
      intent: "availability",
      text: `${free.length} of ${snap.slots.length} bays are free right now — ${bayIds(free)}.`,
      actions:
        snap.scope === "landing"
          ? [{ kind: "navigate", label: "Open the driver view", to: "/driver" }]
          : freeBayActions(snap),
    };
  }

  if (/\b(occupancy|how full|how busy|crowded|percentage|empty)\b/.test(text)) {
    const occupied = countSlots(snap.slots, "occupied");
    return {
      intent: "occupancy",
      text: `Occupancy is ${occupancyRate(snap.slots)}% — ${occupied} occupied, ${countSlots(snap.slots, "available")} free, ${countSlots(snap.slots, "reserved")} reserved and ${countSlots(snap.slots, "maintenance")} out of service.`,
      actions: [{ kind: "navigate", label: "See analytics", to: "/analytics" }],
    };
  }

  if (/\b(prices?|pricing|costs?|fees?|charges?|rates?|how much|₹|rs\.?)\b/.test(text)) {
    const hours = parseHours(question);
    return {
      intent: "pricing",
      text: `It is ₹${snap.firstHour} for the first hour, then ₹${snap.extraHour} for each extra hour, capped at ₹${snap.dailyMax} a day. So ${hours} ${hours === 1 ? "hour" : "hours"} comes to ₹${estimateFee(snap, hours)}.`,
      actions: [
        { kind: "ask", label: "Cost of a full day?", question: "How much for a full day?" },
        { kind: "ask", label: "Adjust pricing", question: "Open pricing settings" },
        { kind: "navigate", label: "Open Settings", to: "/settings" },
      ],
    };
  }

  if (
    /\b(sensors?|devices?|hardware|controller|gate|heartbeat|esp32|offline|fault|healthy|health)\b/.test(
      text,
    )
  ) {
    const offline = snap.slots.filter((slot) => slot.status === "maintenance");
    const faults = offline.length ? ` ${bayIds(offline)} is under maintenance.` : "";
    return {
      intent: "devices",
      text: `Hardware is healthy: ${FACILITY.sensorsOnline} of ${FACILITY.sensorsTotal} sensors reporting, gate servo operational, controller ESP32-PARK-001 last seen 2 seconds ago.${faults}`,
      actions: [{ kind: "navigate", label: "Open Devices", to: "/devices" }],
    };
  }

  if (
    /\b(recent|latest|activity|events?|log|what happened|happening|incident|alerts?|notifications?)\b/.test(
      text,
    )
  ) {
    const [latest, second] = snap.events;
    if (!latest) {
      return { intent: "events", text: "Nothing has been logged yet on this floor." };
    }
    return {
      intent: "events",
      text: [
        `Latest activity: ${latest.kind} — ${latest.detail} at ${latest.time}.`,
        second ? `Before that, ${second.kind.toLowerCase()} — ${second.detail}.` : "",
      ]
        .filter(Boolean)
        .join(" "),
      actions: [{ kind: "navigate", label: "Open Sessions", to: "/sessions" }],
    };
  }

  if (/\b(sessions?|inside|entered|entry|exits?|driving in|parked right now)\b/.test(text)) {
    return {
      intent: "sessions",
      text: `${FACILITY.activeSessions} sessions are active right now, with ${FACILITY.entriesToday} entries and ${FACILITY.exitsToday} exits today. The last entry was ${snap.events[0]?.time ?? "earlier"}.`,
      actions: [{ kind: "navigate", label: "Open Sessions", to: "/sessions" }],
    };
  }

  if (/\b(vehicles?|my car|my plate|plate|registered|saved car|garage)\b/.test(text)) {
    if (!snap.vehicles.length) {
      return { intent: "vehicles", text: "No vehicles are saved in this demo yet." };
    }
    return {
      intent: "vehicles",
      text: `${snap.vehicles.length} vehicle${snap.vehicles.length === 1 ? "" : "s"} saved: ${joinList(snap.vehicles.map((item) => `${item.plate} (${item.model})`))}.`,
      actions: [{ kind: "navigate", label: "Open Vehicles", to: "/vehicles" }],
    };
  }

  if (/\b(analytics?|revenue|trends?|peak hours?|busiest|report|collection|money)\b/.test(text)) {
    return {
      intent: "analytics",
      text: `Revenue collected today is ₹${FACILITY.revenueToday.toLocaleString("en-IN")}, peaking between 9 and 11 AM. Occupancy is running at ${occupancyRate(snap.slots)}% with an average gate response of ${FACILITY.gateSeconds}s.`,
      actions: [{ kind: "navigate", label: "Open Analytics", to: "/analytics" }],
    };
  }

  if (/\b(set ?up|install|hardware|deploy|arduino|esp32|diy|how long does it take)\b/.test(text)) {
    return {
      intent: "setup",
      text: `Install the ESP32 controller, wire the servo gate and mount one sensor per bay — about ${FACILITY.setupMinutes} minutes for a floor. Then add your bays, pricing and opening hours, and the live map builds itself.`,
      actions: [{ kind: "navigate", label: "Open the dashboard", to: "/overview" }],
    };
  }

  if (
    /\b(sales|contact|demo call|talk to (someone|human|us)|pricing plan|enterprise)\b/.test(text)
  ) {
    return {
      intent: "sales",
      text: "Reach the team at hello@smartpark.example or +91 44 4000 1234. Plans start at ₹1,200 per bay per month, and every plan includes the driver app and hardware monitoring.",
      actions: [{ kind: "navigate", label: "See pricing", to: "/overview" }],
    };
  }

  const target = destination(text);
  if (NAVIGATE_TRIGGER.test(text) && target) {
    return {
      intent: "navigate",
      text: `Opening the ${target.label} page.`,
      actions: [{ kind: "navigate", label: `Go to ${target.label}`, to: target.to }],
    };
  }

  return {
    intent: "fallback",
    text: "I did not catch that one. I can report bay status, availability, occupancy, fees, recent activity, hardware health and reservations.",
    actions: startingPrompts(snap.scope)
      .slice(0, 3)
      .map((question) => ({ kind: "ask", label: question, question })),
  };
}
