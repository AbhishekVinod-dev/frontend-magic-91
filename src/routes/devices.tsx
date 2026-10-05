import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Activity, Cpu, DoorOpen, Radio, Router, Wifi, WifiOff, Zap } from "lucide-react";
import { AppShell, SectionHeading } from "@/components/AppShell";
import { useParking } from "@/lib/parking-context";
import { cn } from "@/lib/utils";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/devices")({
  head: () =>
    pageMeta("Devices", "Monitor ESP32 controller, sensors, connectivity and gate health."),
  component: DevicesPage,
});

/**
 * Only the bays the controller is actually wired for can report a real sensor
 * state, so the rest of the floor is listed as demo data rather than pretending
 * to have hardware behind it.
 */
const DEMO_SLOT_IDS = ["S03", "S04", "S05", "S06", "S07", "S08"] as const;

function ago(seconds: number | null): string {
  if (seconds === null) return "no reading yet";
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  return `${Math.round(seconds / 60)}m ago`;
}

/**
 * Reading age is stored in React state derived from the newest reading, so a
 * stale feed is noticed even when no new rows arrive to trigger a render.
 */
function useTick(enabled: boolean): void {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => setTick((value) => value + 1), 5_000);
    return () => clearInterval(id);
  }, [enabled]);
}

type SensorTone = "success" | "muted" | "warning";

function Dot({ tone }: { tone: SensorTone }) {
  return (
    <span
      className={cn(
        "size-2 shrink-0 rounded-full",
        tone === "success" && "bg-success status-pulse",
        tone === "warning" && "bg-warning",
        tone === "muted" && "bg-muted-foreground",
      )}
    />
  );
}

function DevicesPage() {
  const { liveFeed, live } = useParking();
  useTick(liveFeed.receiving);

  const online = liveFeed.receiving && !liveFeed.stale;

  const stats = [
    {
      label: "Connection",
      value: liveFeed.enabled ? (liveFeed.connected ? "Connected" : "Polling") : "Demo data",
      detail: liveFeed.connected ? "Realtime channel" : "REST poll every 5s",
      icon: liveFeed.connected ? Wifi : WifiOff,
    },
    {
      label: "Controller bays",
      value: liveFeed.receiving
        ? `${liveFeed.availability.available} / ${liveFeed.availability.total} free`
        : "—",
      detail: liveFeed.receiving ? "From available_slots" : "Awaiting reading",
      icon: Activity,
    },
    {
      label: "Gate servo",
      value: liveFeed.receiving ? (liveFeed.gateOpen ? "Open" : "Closed") : "Unknown",
      detail: liveFeed.receiving ? "From gate_status" : "Awaiting reading",
      icon: DoorOpen,
    },
    {
      label: "Last reading",
      value: ago(liveFeed.ageSeconds),
      detail: liveFeed.stale ? "Feed is stale" : "Firmware writes every ~5s",
      icon: Radio,
    },
  ];

  const sensors: Array<{ name: string; reading: string; tone: SensorTone }> = liveFeed.receiving
    ? [
        {
          name: "Entrance IR",
          reading: liveFeed.entranceDetected ? "Vehicle" : "Clear",
          tone: liveFeed.entranceDetected ? ("warning" as const) : ("success" as const),
        },
        {
          name: "Exit IR",
          reading: liveFeed.exitDetected ? "Vehicle" : "Clear",
          tone: liveFeed.exitDetected ? ("warning" as const) : ("success" as const),
        },
        ...liveFeed.slotIds.map((id): { name: string; reading: string; tone: SensorTone } => ({
          name: `Slot ${id}`,
          reading: "Reporting",
          tone: "success",
        })),
      ]
    : [];

  const details: Array<[string, string]> = [
    ["Device ID", liveFeed.deviceId ?? "ESP32-PARK-001"],
    ["Device type", "ESP32 controller"],
    ["Bays wired", liveFeed.receiving ? String(liveFeed.availability.total) : "Unknown"],
    ["Gate", liveFeed.receiving ? (liveFeed.gateOpen ? "Open" : "Closed") : "Unknown"],
    ["Firmware writes", liveFeed.receiving ? "Every ~5 seconds" : "No data received"],
    ["Last seen", ago(liveFeed.ageSeconds)],
  ];

  return (
    <AppShell
      title="Devices"
      description="Monitor your connected parking hardware and sensor health."
    >
      <div
        className={cn(
          "mb-6 flex flex-wrap items-center justify-between gap-4 rounded-md border p-5",
          online ? "border-success/25 bg-success-soft" : "border-warning/30 bg-warning-soft",
        )}
      >
        <div className="flex items-center gap-4">
          <span
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-md bg-card",
              online ? "text-success" : "text-warning",
            )}
          >
            <Cpu size={25} />
          </span>
          <div>
            <h2 className="font-display text-lg font-bold">
              {liveFeed.deviceId ?? "ESP32-PARK-001"}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {liveFeed.receiving
                ? `Main parking controller · last reading ${ago(liveFeed.ageSeconds)}`
                : liveFeed.enabled
                  ? "Main parking controller · waiting for first reading"
                  : "Main parking controller · demo data"}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "flex items-center gap-2 rounded bg-card px-3 py-1.5 text-xs font-bold",
            online ? "text-success" : "text-warning",
          )}
        >
          <Dot tone={online ? "success" : liveFeed.receiving ? "warning" : "muted"} />
          {liveFeed.receiving ? (online ? "ONLINE" : "STALE") : "OFFLINE"}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <div key={item.label} className="panel subtle-shadow p-5">
            <span className="flex size-9 items-center justify-center rounded-md bg-info-soft text-info">
              <item.icon size={18} />
            </span>
            <div className="mt-4 text-xs text-muted-foreground">{item.label}</div>
            <div className="mt-1 font-display text-xl font-bold">{item.value}</div>
            <div className="mt-2 text-[11px] text-muted-foreground">{item.detail}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
        <section className="panel p-5 sm:p-6">
          <SectionHeading
            title="Sensor health"
            aside={
              <span
                className={cn(
                  "text-xs font-semibold",
                  sensors.length > 0 ? "text-success" : "text-muted-foreground",
                )}
              >
                {sensors.length > 0 ? `${sensors.length} reporting live` : "No live readings"}
              </span>
            }
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {sensors.map((sensor) => (
              <div
                key={sensor.name}
                className="flex items-center gap-3 rounded-md border border-border p-3 transition-colors hover:bg-canvas"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground">
                  <Zap size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-semibold">{sensor.name}</div>
                  <div className="truncate text-[11px] text-muted-foreground">{sensor.reading}</div>
                </div>
                <Dot tone={sensor.tone} />
                <span className="shrink-0 text-[11px] font-medium text-muted-foreground">Live</span>
              </div>
            ))}

            {DEMO_SLOT_IDS.map((id) => (
              <div
                key={id}
                className="flex items-center gap-3 rounded-md border border-dashed border-border p-3 opacity-70"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground">
                  <Zap size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-semibold">Slot {id}</div>
                  <div className="truncate text-[11px] text-muted-foreground">No sensor wired</div>
                </div>
                <Dot tone="muted" />
                <span className="shrink-0 text-[11px] font-medium text-muted-foreground">Demo</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel h-fit p-5 sm:p-6">
          <SectionHeading title="Controller details" />
          <div className="divide-y divide-border">
            {details.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 py-3 text-xs">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-semibold">{value}</span>
              </div>
            ))}
          </div>

          {live?.lastReadingAt && (
            <div className="mt-4 rounded-md bg-canvas p-3 text-xs">
              <div className="font-semibold">Newest row in parking_status</div>
              <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                {new Date(live.lastReadingAt).toLocaleString("en-IN", { hour12: false })} UTC
              </div>
            </div>
          )}

          <div className="mt-4 flex items-start gap-3 rounded bg-info-soft p-3 text-xs text-info">
            <Router size={18} className="shrink-0" />
            {liveFeed.receiving
              ? "Values above come from Supabase. Bays without a wired sensor are still demo data."
              : "No live readings yet, so this page is showing demo values."}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
