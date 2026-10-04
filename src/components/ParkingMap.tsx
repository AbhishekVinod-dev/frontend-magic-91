import { CarFront, ArrowDown, LockKeyhole, Wrench, CircleCheck, ParkingSquare } from "lucide-react";
import { useParking, type Slot } from "@/lib/parking-context";
import { Button } from "./Button";

const themes = {
  available: { surface: "bg-success-soft border-success/30", icon: "text-success", label: "Available", badge: "bg-success" },
  occupied: { surface: "bg-danger-soft border-danger/20", icon: "text-danger", label: "Occupied", badge: "bg-danger" },
  reserved: { surface: "bg-warning-soft border-warning/30", icon: "text-warning", label: "Reserved", badge: "bg-warning" },
  maintenance: { surface: "bg-muted border-border", icon: "text-muted-foreground", label: "Maintenance", badge: "bg-muted-foreground" },
};
export function StatusPill({ status }: { status: Slot["status"] }) { const t = themes[status]; return <span className={`inline-flex items-center gap-1.5 rounded px-2 py-1 text-[11px] font-semibold ${t.surface} ${t.icon}`}><span className={`size-1.5 rounded-full ${t.badge}`}/>{t.label}</span>; }
export function ParkingMap({ compact = false, onSelect, selected }: { compact?: boolean; onSelect?: (id: string) => void; selected?: string }) {
  const { slots } = useParking();
  return <div className="relative overflow-hidden rounded-md border border-border bg-canvas p-4 sm:p-6">
    <div className="mb-5 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-muted-foreground"><span className="h-px w-9 bg-border"/> Entrance <ArrowDown size={13}/><span className="h-px w-9 bg-border"/></div>
    <div className="mx-auto mb-5 flex max-w-[360px] items-center justify-between rounded border border-dashed border-muted-foreground/40 bg-card px-5 py-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"><span>← Exit</span><span className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-success"/> Gate open</span><span>Entry →</span></div>
    <div className={`mx-auto grid max-w-[540px] grid-cols-2 gap-x-7 gap-y-3 sm:gap-x-14 ${compact ? "" : "sm:gap-y-5"}`}>
      {slots.map(slot => { const t = themes[slot.status]; const selectedClass = selected === slot.id ? "ring-2 ring-primary ring-offset-2" : ""; return <Button key={slot.id} variant="ghost" disabled={!onSelect || slot.status !== "available"} onClick={() => onSelect?.(slot.id)} className={`group relative flex h-auto min-h-[88px] w-full flex-col items-start justify-between overflow-hidden rounded-md border p-3 text-left transition-transform enabled:hover:-translate-y-0.5 disabled:opacity-100 sm:min-h-[105px] sm:p-4 ${t.surface} ${selectedClass}`}><div className="flex w-full items-start justify-between"><span className="font-display text-sm font-bold text-foreground sm:text-base">{slot.id}</span>{slot.status === "occupied" ? <CarFront size={21} className={t.icon}/> : slot.status === "reserved" ? <LockKeyhole size={18} className={t.icon}/> : slot.status === "maintenance" ? <Wrench size={18} className={t.icon}/> : selected === slot.id ? <CircleCheck size={20} className={t.icon}/> : <ParkingSquare size={20} className={t.icon}/>}</div><span className={`text-[10px] font-semibold sm:text-xs ${t.icon}`}>{slot.status === "occupied" && slot.vehicle ? slot.vehicle : t.label}</span></Button>; })}
    </div><div className="mx-auto mt-5 flex max-w-[540px] items-center justify-center gap-2 rounded border border-dashed border-border py-2 text-[10px] font-bold uppercase tracking-[.18em] text-muted-foreground">Drive lane</div>
  </div>;
}
export function MapLegend() { return <div className="flex flex-wrap gap-x-4 gap-y-2">{Object.entries(themes).map(([key, t]) => <span key={key} className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><span className={`size-2 rounded-full ${t.badge}`}/>{t.label}</span>)}</div>; }
