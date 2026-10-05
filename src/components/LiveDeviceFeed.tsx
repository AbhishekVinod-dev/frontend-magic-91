import { DoorOpen, Radio, TriangleAlert, Wifi, WifiOff } from "lucide-react";
import { useParking } from "@/lib/parking-context";
import { cn } from "@/lib/utils";

function ago(seconds: number | null): string {
  if (seconds === null) return "no reading yet";
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  return `${Math.round(seconds / 60)}m ago`;
}

/**
 * Live controller panel.
 *
 * Shows the newest Supabase reading so the dashboard can be traced back to the
 * hardware. Bays the ESP32 reports are labelled, because its `available_slots`
 * count only covers those bays and must not be read against the eight-bay
 * demo floor.
 */
export function LiveDeviceFeed() {
  const { liveFeed, live } = useParking();

  if (!liveFeed.enabled) {
    return (
      <section className="panel p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <WifiOff size={16} />
          </span>
          <h2 className="font-display text-base font-bold tracking-tight">Controller feed</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Showing demo data.
          {liveFeed.configProblem ? ` ${liveFeed.configProblem}` : ""}
        </p>
        {liveFeed.configProblem && (
          <p className="mt-2 text-xs text-muted-foreground">
            Add <code className="font-mono">VITE_SUPABASE_URL</code> and{" "}
            <code className="font-mono">VITE_SUPABASE_ANON_KEY</code> to{" "}
            <code className="font-mono">.env.local</code> to read the ESP32.
          </p>
        )}
      </section>
    );
  }

  if (liveFeed.error) {
    return (
      <section className="panel border-danger/25 p-5 sm:p-6">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-md bg-danger-soft text-danger">
            <TriangleAlert size={16} />
          </span>
          <h2 className="font-display text-base font-bold tracking-tight">Controller feed</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Could not read the latest reading from Supabase.
        </p>
        <p className="mt-2 break-words text-xs text-danger">{liveFeed.error}</p>
      </section>
    );
  }

  if (!liveFeed.receiving) {
    return (
      <section className="panel p-5 sm:p-6">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <Radio size={16} />
          </span>
          <h2 className="font-display text-base font-bold tracking-tight">Controller feed</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Connected to Supabase, waiting for the first reading from the controller.
        </p>
      </section>
    );
  }

  const status = liveFeed.stale ? "stale" : "live";
  const tone = status === "live" ? "bg-success-soft text-success" : "bg-warning-soft text-warning";

  return (
    <section className="panel p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-md bg-info-soft text-info">
            <Radio size={16} />
          </span>
          <div>
            <h2 className="font-display text-base font-bold tracking-tight">Controller feed</h2>
            <p className="text-[11px] text-muted-foreground">
              {liveFeed.deviceId ?? "ESP32"} &middot; {ago(liveFeed.ageSeconds)}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "flex items-center gap-1.5 rounded px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide",
            tone,
          )}
        >
          <span
            className={cn(
              "size-1.5 rounded-full",
              status === "live" ? "bg-success status-pulse" : "bg-warning",
            )}
          />
          {status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-md bg-canvas p-3">
          <div className="text-[11px] font-semibold text-muted-foreground">Controller bays</div>
          <div className="mt-1 font-display text-2xl font-bold leading-none tabular-nums">
            {liveFeed.availability.available}
            <span className="text-base text-muted-foreground">/{liveFeed.availability.total}</span>
          </div>
        </div>
        <div className="rounded-md bg-canvas p-3">
          <div className="text-[11px] font-semibold text-muted-foreground">Gate</div>
          <div
            className={cn(
              "mt-1 font-display text-base font-bold leading-tight",
              liveFeed.gateOpen ? "text-success" : "text-muted-foreground",
            )}
          >
            {liveFeed.gateOpen ? "Open" : "Closed"}
          </div>
        </div>
        <div className="rounded-md bg-canvas p-3">
          <div className="text-[11px] font-semibold text-muted-foreground">Entrance IR</div>
          <div
            className={cn(
              "mt-1 font-display text-base font-bold leading-tight",
              liveFeed.entranceDetected ? "text-warning" : "text-muted-foreground",
            )}
          >
            {liveFeed.entranceDetected ? "Vehicle" : "Clear"}
          </div>
        </div>
        <div className="rounded-md bg-canvas p-3">
          <div className="text-[11px] font-semibold text-muted-foreground">Exit IR</div>
          <div
            className={cn(
              "mt-1 font-display text-base font-bold leading-tight",
              liveFeed.exitDetected ? "text-warning" : "text-muted-foreground",
            )}
          >
            {liveFeed.exitDetected ? "Vehicle" : "Clear"}
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-3 border-t border-border pt-4 text-xs">
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">Bays reported by controller</span>
          <span className="font-semibold">{liveFeed.slotIds.join(", ")}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">Realtime channel</span>
          <span
            className={cn(
              "flex items-center gap-1.5 font-semibold",
              liveFeed.connected ? "text-success" : "text-warning",
            )}
          >
            {liveFeed.connected ? <Wifi size={13} /> : <WifiOff size={13} />}
            {liveFeed.connected ? "Subscribed" : "Polling every 5s"}
          </span>
        </div>
        <p className="flex items-start gap-1.5 leading-5 text-muted-foreground">
          <DoorOpen size={13} className="mt-0.5 shrink-0" />
          The controller counts only {liveFeed.availability.total} bays. Other bays on this floor
          come from demo data until more sensors are wired.
        </p>
      </div>

      {live?.lastReadingAt && (
        <p className="mt-4 border-t border-border pt-3 text-[11px] text-muted-foreground">
          Last reading{" "}
          <time className="font-mono tabular-nums">
            {new Date(live.lastReadingAt).toLocaleTimeString("en-IN", { hour12: false })}
          </time>{" "}
          UTC
        </p>
      )}
    </section>
  );
}
