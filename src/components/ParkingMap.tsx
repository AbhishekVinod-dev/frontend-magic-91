import {
  ArrowDown,
  CarFront,
  CircleCheck,
  LockKeyhole,
  ParkingSquare,
  Radio,
  Wrench,
} from "lucide-react";
import { useParking, type Slot } from "@/lib/parking-context";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

const themes = {
  available: {
    surface: "bg-success-soft border-success/30 hover:border-success/60",
    icon: "text-success",
    label: "Available",
    badge: "bg-success",
  },
  occupied: {
    surface: "bg-danger-soft border-danger/20",
    icon: "text-danger",
    label: "Occupied",
    badge: "bg-danger",
  },
  reserved: {
    surface: "bg-warning-soft border-warning/30",
    icon: "text-warning",
    label: "Reserved",
    badge: "bg-warning",
  },
  maintenance: {
    surface: "bg-muted border-border",
    icon: "text-muted-foreground",
    label: "Maintenance",
    badge: "bg-muted-foreground",
  },
} as const;

export function StatusPill({ status }: { status: Slot["status"] }) {
  const t = themes[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded px-2 py-1 text-[11px] font-semibold",
        t.surface,
        t.icon,
      )}
    >
      <span className={cn("size-1.5 shrink-0 rounded-full", t.badge)} />
      {t.label}
    </span>
  );
}

export function ParkingMap({
  compact = false,
  onSelect,
  selected,
  liveSlotIds,
  gateOpen,
}: {
  compact?: boolean;
  onSelect?: (id: string) => void;
  selected?: string | undefined;
  /** Bays whose status comes from the controller rather than demo state. */
  liveSlotIds?: readonly string[] | undefined;
  /** Gate position from the controller. `undefined` leaves the demo label. */
  gateOpen?: boolean | undefined;
}) {
  const { slots } = useParking();
  const liveBays = liveSlotIds ?? [];

  return (
    <div className="relative overflow-hidden rounded-md border border-border bg-canvas p-4 sm:p-6">
      <div className="mb-5 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-muted-foreground">
        <span className="h-px w-9 bg-border" />
        Entrance <ArrowDown size={13} />
        <span className="h-px w-9 bg-border" />
      </div>

      <div className="mx-auto mb-5 flex max-w-[360px] items-center justify-between rounded border border-dashed border-muted-foreground/40 bg-card px-5 py-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        <span>&larr; Exit</span>
        <span className="flex items-center gap-2">
          <span
            className={cn(
              "size-1.5 rounded-full",
              gateOpen === false ? "bg-muted-foreground" : "bg-success",
            )}
          />
          {gateOpen === false ? "Gate closed" : "Gate open"}
        </span>
        <span>Entry &rarr;</span>
      </div>

      <div
        className={cn(
          "mx-auto grid max-w-[540px] grid-cols-2 gap-x-7 gap-y-3 sm:gap-x-14",
          !compact && "sm:gap-y-5",
        )}
      >
        {slots.map((slot) => {
          const t = themes[slot.status];
          const isSelected = selected === slot.id;
          const Icon =
            slot.status === "occupied"
              ? CarFront
              : slot.status === "reserved"
                ? LockKeyhole
                : slot.status === "maintenance"
                  ? Wrench
                  : isSelected
                    ? CircleCheck
                    : ParkingSquare;

          const isLive = liveBays.includes(slot.id);

          return (
            <Button
              key={slot.id}
              variant="ghost"
              disabled={!onSelect || slot.status !== "available"}
              onClick={() => onSelect?.(slot.id)}
              aria-pressed={onSelect ? isSelected : undefined}
              title={
                isLive ? `${slot.id} — status from the controller sensor` : `${slot.id} — demo data`
              }
              className={cn(
                "group relative flex h-auto min-h-[88px] w-full flex-col items-start justify-between gap-2 overflow-hidden rounded-md border p-3 text-left transition-all duration-200 sm:min-h-[105px] sm:p-4",
                "enabled:hover:-translate-y-0.5 disabled:opacity-100 disabled:hover:translate-y-0",
                t.surface,
                isSelected && "ring-2 ring-primary ring-offset-2",
                isLive && "ring-1 ring-info/60",
              )}
            >
              <div className="flex w-full items-start justify-between gap-2">
                <span className="flex items-center gap-1.5 font-display text-sm font-bold text-foreground sm:text-base">
                  {slot.id}
                  {isLive && (
                    <Radio
                      size={12}
                      className="shrink-0 text-info"
                      aria-label="Live sensor reading"
                    />
                  )}
                </span>
                <Icon
                  size={20}
                  className={cn("shrink-0 transition-transform", t.icon, isSelected && "scale-110")}
                />
              </div>
              <span className={cn("text-[10px] font-semibold sm:text-xs", t.icon)}>
                {slot.status === "occupied" && slot.vehicle ? slot.vehicle : t.label}
              </span>
            </Button>
          );
        })}
      </div>

      <div className="mx-auto mt-5 flex max-w-[540px] items-center justify-center gap-2 rounded border border-dashed border-border py-2 text-[10px] font-bold uppercase tracking-[.18em] text-muted-foreground">
        Drive lane
      </div>
    </div>
  );
}

export function MapLegend() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2">
      {Object.entries(themes).map(([key, t]) => (
        <span key={key} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className={cn("size-2 shrink-0 rounded-full", t.badge)} />
          {t.label}
        </span>
      ))}
    </div>
  );
}
