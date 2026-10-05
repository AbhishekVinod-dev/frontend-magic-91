import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useLiveStatus, useRealtimeConnected } from "./supabase-hooks";
import { isSupabaseConfigured, supabaseConfigProblem } from "./supabase";
import {
  isReadingStale,
  liveAvailability,
  liveSlotIds,
  mergeLiveSlots,
  readingAgeSeconds,
} from "./live-parking";
import type { LiveStatus } from "./supabase-schema";

type SlotStatus = "available" | "occupied" | "reserved" | "maintenance";
export type Slot = { id: string; status: SlotStatus; vehicle?: string | undefined };
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

type ParkingContext = {
  slots: Slot[];
  vehicles: Vehicle[];
  events: Event[];
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
  const [rates, setRatesState] = useState({ firstHour: 20, extraHour: 10, dailyMax: 100 });

  const { data: live, error: liveError } = useLiveStatus();
  const connected = useRealtimeConnected();

  const addEvent = (kind: string, detail: string, tone: Event["tone"]) =>
    setEvents((prev) => [
      {
        id: Date.now(),
        kind,
        detail,
        time: new Date().toLocaleTimeString("en-IN", { hour12: false }),
        tone,
      },
      ...prev,
    ]);

  const updateSlot = (id: string, status: SlotStatus) => {
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
    addEvent(
      "Slot status updated",
      `${id} · ${status.charAt(0).toUpperCase()}${status.slice(1)}`,
      status === "available" ? "success" : status === "occupied" ? "danger" : "warning",
    );
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

  const value = useMemo<ParkingContext>(
    () => ({
      slots,
      vehicles,
      events,
      ...rates,
      live: live ?? null,
      liveFeed,
      updateSlot,
      reserveSlot,
      addVehicle,
      removeVehicle,
      setRates,
    }),
    [slots, vehicles, events, rates, live, liveFeed],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useParking() {
  const context = useContext(Context);
  if (!context) throw new Error("ParkingProvider is missing");
  return context;
}
