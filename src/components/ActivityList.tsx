import { ArrowDownLeft, ArrowUpRight, CalendarCheck, ParkingSquare } from "lucide-react";
import { useParking } from "@/lib/parking-context";

const tones = {
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
  warning: "bg-warning-soft text-warning",
  info: "bg-info-soft text-info",
} as const;

export function ActivityList({ limit }: { limit?: number }) {
  const { events } = useParking();

  if (!events.length) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No activity recorded yet.
      </p>
    );
  }

  return (
    <div className="divide-y divide-border">
      {events.slice(0, limit).map(event => {
        const Icon = event.kind.includes("entered")
          ? ArrowDownLeft
          : event.kind.includes("exited")
            ? ArrowUpRight
            : event.kind.includes("reserved")
              ? CalendarCheck
              : ParkingSquare;

        return (
          <div key={event.id} className="flex items-center gap-3 py-4 first:pt-0 last:pb-0">
            <span
              className={`flex size-9 shrink-0 items-center justify-center rounded-md ${tones[event.tone]}`}
            >
              <Icon size={17} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{event.kind}</div>
              <div className="mt-0.5 truncate text-xs text-muted-foreground">{event.detail}</div>
            </div>
            <time className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
              {event.time}
            </time>
          </div>
        );
      })}
    </div>
  );
}