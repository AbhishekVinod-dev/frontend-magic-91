import { createContext, useContext, useState, type ReactNode } from "react";

type SlotStatus = "available" | "occupied" | "reserved" | "maintenance";
export type Slot = { id: string; status: SlotStatus; vehicle?: string };
export type Vehicle = { plate: string; type: string; model: string; color: string };
export type Event = { id: number; kind: string; detail: string; time: string; tone: "success" | "danger" | "warning" | "info" };
const initialSlots: Slot[] = [
  { id: "S01", status: "available" }, { id: "S02", status: "occupied", vehicle: "TN 38 AB 1234" },
  { id: "S03", status: "available" }, { id: "S04", status: "occupied", vehicle: "TN 01 XY 5678" },
  { id: "S05", status: "available" }, { id: "S06", status: "reserved" },
  { id: "S07", status: "available" }, { id: "S08", status: "maintenance" },
];
const initialEvents: Event[] = [
  { id: 1, kind: "Vehicle entered", detail: "TN 38 AB 1234 · Gate opened", time: "10:32:14", tone: "success" },
  { id: 2, kind: "Slot occupied", detail: "S02 · TN 38 AB 1234", time: "10:30:42", tone: "danger" },
  { id: 3, kind: "Vehicle exited", detail: "TN 09 CD 4021 · Gate closed", time: "10:12:20", tone: "info" },
  { id: 4, kind: "Slot reserved", detail: "S06 · Arrival at 11:30 AM", time: "09:54:11", tone: "warning" },
];
type ParkingContext = {
  slots: Slot[]; vehicles: Vehicle[]; events: Event[]; firstHour: number; extraHour: number; dailyMax: number;
  updateSlot: (id: string, status: SlotStatus) => void;
  reserveSlot: (id: string, plate: string, arrival: string) => void;
  addVehicle: (vehicle: Vehicle) => void;
  removeVehicle: (plate: string) => void;
  setRates: (rates: { firstHour: number; extraHour: number; dailyMax: number }) => void;
};
const Context = createContext<ParkingContext | null>(null);
export function ParkingProvider({ children }: { children: ReactNode }) {
  const [slots, setSlots] = useState(initialSlots);
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    { plate: "TN 38 AB 1234", type: "Car", model: "Hyundai i20", color: "Silver" },
    { plate: "TN 01 XY 5678", type: "Bike", model: "Honda Activa", color: "Black" },
  ]);
  const [events, setEvents] = useState(initialEvents);
  const [rates, setRatesState] = useState({ firstHour: 20, extraHour: 10, dailyMax: 100 });
  const addEvent = (kind: string, detail: string, tone: Event["tone"]) => setEvents(prev => [{ id: Date.now(), kind, detail, time: new Date().toLocaleTimeString("en-IN", { hour12: false }), tone }, ...prev]);
  const updateSlot = (id: string, status: SlotStatus) => {
    setSlots(prev => prev.map(slot => slot.id === id ? { ...slot, status, ...(status === "occupied" && slot.vehicle ? { vehicle: slot.vehicle } : { vehicle: undefined }) } : slot));
    addEvent("Slot status updated", `${id} · ${status.charAt(0).toUpperCase()}${status.slice(1)}`, status === "available" ? "success" : status === "occupied" ? "danger" : "warning");
  };
  const reserveSlot = (id: string, plate: string, arrival: string) => {
    setSlots(prev => prev.map(slot => slot.id === id ? { ...slot, status: "reserved" } : slot));
    addEvent("Slot reserved", `${id} · ${plate} · ${arrival}`, "warning");
  };
  const addVehicle = (vehicle: Vehicle) => setVehicles(prev => [...prev, vehicle]);
  const removeVehicle = (plate: string) => setVehicles(prev => prev.filter(vehicle => vehicle.plate !== plate));
  const setRates = (next: typeof rates) => setRatesState(next);
  return <Context.Provider value={{ slots, vehicles, events, ...rates, updateSlot, reserveSlot, addVehicle, removeVehicle, setRates }}>{children}</Context.Provider>;
}
export function useParking() {
  const context = useContext(Context);
  if (!context) throw new Error("ParkingProvider is missing");
  return context;
}
