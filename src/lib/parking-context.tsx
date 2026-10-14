import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLiveStatus, useRealtimeConnected } from "./supabase-hooks";
import { isSupabaseConfigured, supabaseConfigProblem } from "./supabase";
import {
  isReadingStale,
  liveAvailability,
  liveSlotIds,
  mergeLiveSlots,
  readingAgeSeconds,
} from "./live-parking";
import { clockTime, type ParkingSession } from "./sessions";
import type { LiveStatus } from "./supabase-schema";

type SlotStatus = "available" | "occupied" | "reserved" | "maintenance";
export type Slot = { id: string; status: SlotStatus; vehicle?: string | undefined };
/** Servo barrier position, shared so every view reports the same gate state. */
export type GateStatus = "CLOSED" | "OPENING" | "OPEN";
export type Vehicle = { plate: string; type: string; model: string; color: string };
export type Event = {
  id: number;
  kind: string;
  detail: string;
  time: string;
  tone: "success" | "danger" | "warning" | "info";
};

/** Live controller state, so the UI can show where its numbers come from. */
export type LiveFeed = {
  enabled: boolean;
  connected: boolean;
  /** True once readings have arrived from the ESP32. */
  receiving: boolean;
  stale: boolean;
  error: string | null;
  /** Bays the controller reports, e.g. ["S01", "S02"]. */
  slotIds: string[];
  availability: { available: number; total: number };
  ageSeconds: number | null;
  deviceId: string | null;
  gateOpen: boolean;
  entranceDetected: boolean;
  exitDetected: boolean;
  /** Set when Supabase is not usable, explaining why demo data is showing. */
  configProblem: string | null;
};

const DISABLED_FEED: LiveFeed = {
  enabled: false,
  connected: false,
  receiving: false,
  stale: false,
  error: null,
  slotIds: [],
  availability: { available: 0, total: 0 },
  ageSeconds: null,
  deviceId: null,
  gateOpen: false,
  entranceDetected: false,
  exitDetected: false,
  configProblem: null,
};

const initialSlots: Slot[] = [
  { id: "S01", status: "available" },
  { id: "S02", status: "occupied", vehicle: "TN 38 AB 1234" },
  { id: "S03", status: "available" },
  { id: "S04", status: "occupied", vehicle: "TN 01 XY 5678" },
  { id: "S05", status: "available" },
  { id: "S06", status: "reserved" },
  { id: "S07", status: "available" },
  { id: "S08", status: "maintenance" },
];
const initialEvents: Event[] = [
  {
    id: 1,
    kind: "Vehicle entered",
    detail: "TN 38 AB 1234 · Gate opened",
    time: "10:32:14",
    tone: "success",
  },
  { id: 2, kind: "Slot occupied", detail: "S02 · TN 38 AB 1234", time: "10:30:42", tone: "danger" },
  {
    id: 3,
    kind: "Vehicle exited",
    detail: "TN 09 CD 4021 · Gate closed",
    time: "10:12:20",
    tone: "info",
  },
  {
    id: 4,
    kind: "Slot reserved",
    detail: "S06 · Arrival at 11:30 AM",
    time: "09:54:11",
    tone: "warning",
  },
];

/**
 * Seed sessions mirror the demo floor: the two occupied bays are active, and
 * two completed stays give the history table something to show from the start.
 */
const initialSessions: ParkingSession[] = [
  {
    id: 1,
    slot: "S02",
    plate: "TN 38 AB 1234",
    arrival: "10:32:14",
    departure: null,
    status: "Active",
  },
  {
    id: 2,
    slot: "S04",
    plate: "TN 01 XY 5678",
    arrival: "09:48:07",
    departure: null,
    status: "Active",
  },
  {
    id: 3,
    slot: "S03",
    plate: "TN 09 CD 4021",
    arrival: "08:30:00",
    departure: "10:12:20",
    status: "Completed",
  },
  {
    id: 4,
    slot: "S01",
    plate: "TN 42 KL 9102",
    arrival: "07:15:00",
    departure: "09:02:41",
    status: "Completed",
  },
];

type ParkingContext = {
  slots: Slot[];
  vehicles: Vehicle[];
  events: Event[];
  /** Vehicle stays with arrival and departure timestamps, newest first. */
  sessions: ParkingSession[];
  /** Gate position shown app-wide: the controller feed when receiving, else the demo gate. */
  gate: GateStatus;
  /** Move the demo gate. A receiving controller owns the real barrier and overrides this. */
  setGate: (status: GateStatus) => void;
  firstHour: number;
  extraHour: number;
  dailyMax: number;
  /** Newest controller reading, or `null` when running on demo data. */
  live: LiveStatus | null;
  liveFeed: LiveFeed;
  updateSlot: (id: string, status: SlotStatus) => void;
  reserveSlot: (id: string, plate: string, arrival: string) => void;
  addVehicle: (vehicle: Vehicle) => void;
  removeVehicle: (plate: string) => void;
  setRates: (rates: { firstHour: number; extraHour: number; dailyMax: number }) => void;
};

const Context = createContext<ParkingContext | null>(null);

export function ParkingProvider({ children }: { children: ReactNode }) {
  // Demo state. Bays the controller reports are overlaid from live readings.
  const [demoSlots, setDemoSlots] = useState(initialSlots);
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    { plate: "TN 38 AB 1234", type: "Car", model: "Hyundai i20", color: "Silver" },
    { plate: "TN 01 XY 5678", type: "Bike", model: "Honda Activa", color: "Black" },
  ]);
  const [events, setEvents] = useState(initialEvents);
  const [sessions, setSessions] = useState<ParkingSession[]>(initialSessions);
  const [demoGate, setDemoGateState] = useState<GateStatus>("CLOSED");
  const [rates, setRatesState] = useState({ firstHour: 20, extraHour: 10, dailyMax: 100 });

  const { data: live, error: liveError } = useLiveStatus();
  const connected = useRealtimeConnected();

  const sessionSeq = useRef(initialSessions.length);

  const addEvent = useCallback(
    (kind: string, detail: string, tone: Event["tone"]) =>
      setEvents((prev) => [{ id: Date.now(), kind, detail, time: clockTime(), tone }, ...prev]),
    [],
  );

  const setGate = useCallback((status: GateStatus) => setDemoGateState(status), []);

  const updateSlot = (id: string, status: SlotStatus) => {
    const before = demoSlots.find((slot) => slot.id === id)?.status;
    setDemoSlots((prev) =>
      prev.map((slot) =>
        slot.id === id
          ? {
              ...slot,
              status,
              ...(status === "occupied" && slot.vehicle
                ? { vehicle: slot.vehicle }
                : { vehicle: undefined }),
            }
          : slot,
      ),
    );

    // Arrivals and departures get their timestamps logged by the status watcher
    // below, so only other manual changes need an event from here.
    const isArrival = status === "occupied" && before !== "occupied";
    const isDeparture = before === "occupied" && status !== "occupied";
    if (!isArrival && !isDeparture) {
      addEvent(
        "Slot status updated",
        `${id} · ${status.charAt(0).toUpperCase()}${status.slice(1)}`,
        status === "available" ? "success" : status === "occupied" ? "danger" : "warning",
      );
    }
  };
  const reserveSlot = (id: string, plate: string, arrival: string) => {
    setDemoSlots((prev) =>
      prev.map((slot) => (slot.id === id ? { ...slot, status: "reserved" } : slot)),
    );
    addEvent("Slot reserved", `${id} · ${plate} · ${arrival}`, "warning");
  };
  const addVehicle = (vehicle: Vehicle) => setVehicles((prev) => [...prev, vehicle]);
  const removeVehicle = (plate: string) =>
    setVehicles((prev) => prev.filter((vehicle) => vehicle.plate !== plate));
  const setRates = (next: typeof rates) => setRatesState(next);

  const slots = useMemo(() => mergeLiveSlots(demoSlots, live), [demoSlots, live]);

  // Watch every bay's status — manual changes and live sensor readings alike —
  // and stamp a session the moment a vehicle arrives or leaves.
  const previousStatus = useRef<Record<string, SlotStatus> | null>(null);
  useEffect(() => {
    const next: Record<string, SlotStatus> = {};
    for (const slot of slots) next[slot.id] = slot.status;

    const previous = previousStatus.current;
    previousStatus.current = next;
    // The first pass only records a baseline, so the seeded floor is not
    // mistaken for a wave of arrivals.
    if (!previous) return;

    for (const slot of slots) {
      const before = previous[slot.id];
      if (before === undefined || before === slot.status) continue;

      const time = clockTime();
      const plate = slot.vehicle ?? "Unregistered vehicle";
      sessionSeq.current += 1;
      const id = sessionSeq.current;

      if (slot.status === "occupied") {
        setSessions((list) =>
          list.some((s) => s.slot === slot.id && s.status === "Active")
            ? list
            : [
                { id, slot: slot.id, plate, arrival: time, departure: null, status: "Active" },
                ...list,
              ],
        );
        addEvent("Vehicle arrived", `${slot.id} · ${plate} · Arrived ${time}`, "success");
      } else if (before === "occupied") {
        setSessions((list) => {
          let closed = false;
          const updated = list.map((session) => {
            if (!closed && session.slot === slot.id && session.status === "Active") {
              closed = true;
              return { ...session, departure: time, status: "Completed" as const };
            }
            return session;
          });
          return closed
            ? updated
            : [
                { id, slot: slot.id, plate, arrival: "—", departure: time, status: "Completed" },
                ...list,
              ];
        });
        addEvent("Vehicle departed", `${slot.id} · ${plate} · Departed ${time}`, "info");
      }
    }
  }, [slots, addEvent]);

  const liveFeed = useMemo<LiveFeed>(() => {
    if (!isSupabaseConfigured) {
      return { ...DISABLED_FEED, configProblem: supabaseConfigProblem() };
    }
    return {
      enabled: true,
      connected,
      // `!= null` rather than `!== null`: the query reports `undefined` while it
      // is still in flight, and calling that "receiving" would show a live badge
      // with no reading behind it.
      receiving: live != null,
      stale: isReadingStale(live),
      error: liveError instanceof Error ? liveError.message : liveError ? String(liveError) : null,
      slotIds: liveSlotIds(live),
      availability: liveAvailability(live),
      ageSeconds: readingAgeSeconds(live),
      deviceId: live?.deviceId ?? null,
      gateOpen: live?.gateOpen ?? false,
      entranceDetected: live?.entranceDetected ?? false,
      exitDetected: live?.exitDetected ?? false,
      configProblem: null,
    };
  }, [connected, live, liveError]);

  // Gate position across the whole app. A receiving controller wins because it
  // is the real barrier; otherwise the demo/simulated gate drives every view.
  const gate: GateStatus = liveFeed.receiving
    ? liveFeed.gateOpen
      ? "OPEN"
      : "CLOSED"
    : demoGate;

  const previousGate = useRef<GateStatus | null>(null);
  useEffect(() => {
    const previous = previousGate.current;
    previousGate.current = gate;
    // Baseline on first render; only log real open/close movements.
    if (!previous || previous === gate) return;
    if (gate === "OPEN") addEvent("Gate opened", "Servo barrier raised", "success");
    else if (gate === "CLOSED") addEvent("Gate closed", "Servo barrier lowered", "info");
  }, [gate, addEvent]);

  const value = useMemo<ParkingContext>(
    () => ({
      slots,
      vehicles,
      events,
      sessions,
      gate,
      setGate,
      ...rates,
      live: live ?? null,
      liveFeed,
      updateSlot,
      reserveSlot,
      addVehicle,
      removeVehicle,
      setRates,
    }),
    [slots, vehicles, events, sessions, gate, setGate, rates, live, liveFeed],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useParking() {
  const context = useContext(Context);
  if (!context) throw new Error("ParkingProvider is missing");
  return context;
}
