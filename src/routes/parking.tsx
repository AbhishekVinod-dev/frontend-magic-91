import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Settings2 } from "lucide-react";
import { AppShell, SectionHeading } from "@/components/AppShell";
import { ParkingMap, MapLegend, StatusPill } from "@/components/ParkingMap";
import { Button } from "@/components/Button";
import { useParking, type Slot } from "@/lib/parking-context";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/parking")({
  head: () => pageMeta("Parking map", "View and manage every space in the SmartPark facility."),
  component: ParkingPage,
});

const filters = ["All slots", "Available", "Occupied", "Reserved", "Maintenance"] as const;

function ParkingPage() {
  const { slots, updateSlot } = useParking();
  const [filter, setFilter] = useState<(typeof filters)[number]>("All slots");

  const shown = slots.filter(
    slot => filter === "All slots" || slot.status === filter.toLowerCase(),
  );

  return (
    <AppShell
      title="Parking map"
      description="A live view of every space in your facility."
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,1fr)]">
        <section className="panel p-5 sm:p-6">
          <SectionHeading
            title="Facility floor plan"
            aside={
              <span className="flex items-center gap-2 text-xs text-success">
                <span className="size-2 rounded-full bg-success status-pulse" /> Live status
              </span>
            }
          />
          <ParkingMap />
          <div className="mt-5">
            <MapLegend />
          </div>
        </section>

        <section className="panel p-5 sm:p-6">
          <SectionHeading
            title="Slot management"
            aside={<Settings2 size={17} className="text-muted-foreground" />}
          />

          <div className="mb-5 flex flex-wrap gap-2">
            {filters.map(item => (
              <Button
                key={item}
                variant={filter === item ? "dark" : "secondary"}
                size="sm"
                onClick={() => setFilter(item)}
              >
                {item}
              </Button>
            ))}
          </div>

          <div className="divide-y divide-border">
            {shown.map(slot => (
              <div key={slot.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted font-display text-xs font-bold">
                  {slot.id.slice(1)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold">Slot {slot.id}</div>
                  <div className="truncate text-[11px] text-muted-foreground">
                    {slot.vehicle || `Sensor ${slot.id} · Level 01`}
                  </div>
                </div>
                <StatusPill status={slot.status} />
                <select
                  aria-label={`Change ${slot.id} status`}
                  value={slot.status}
                  onChange={event => updateSlot(slot.id, event.target.value as Slot["status"])}
                  className="surface-input h-8 w-28 shrink-0 px-2 text-xs text-foreground"
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="reserved">Reserved</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            ))}
          </div>

          {shown.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No slots match this filter.
            </p>
          )}

          <div className="mt-5 flex items-center gap-2 rounded-md bg-info-soft p-3 text-xs text-info">
            <Check size={16} className="shrink-0" />
            Changes here update this preview only.
          </div>
        </section>
      </div>
    </AppShell>
  );
}