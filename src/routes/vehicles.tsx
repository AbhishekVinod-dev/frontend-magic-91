import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Bike, CarFront, Plus, Trash2, X } from "lucide-react";
import { AppShell, SectionHeading } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { useParking } from "@/lib/parking-context";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/vehicles")({
  head: () => pageMeta("Vehicles", "View and manage vehicles registered at SmartPark."),
  component: VehiclesPage,
});

const emptyForm = { plate: "", type: "Car", model: "", color: "" };

function VehiclesPage() {
  const { vehicles, addVehicle, removeVehicle } = useParking();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    const plate = form.plate.trim().toUpperCase();
    if (vehicles.some(vehicle => vehicle.plate === plate)) {
      setError(`${plate} is already registered.`);
      return;
    }
    setError("");
    addVehicle({ ...form, plate });
    setOpen(false);
    setForm(emptyForm);
  }

  return (
    <AppShell
      title="Vehicles"
      description="A clear view of vehicles associated with this facility."
    >
      <section className="panel p-5 sm:p-6">
        <SectionHeading
          title={`Registered vehicles (${vehicles.length})`}
          aside={
            <Button size="sm" onClick={() => setOpen(true)}>
              <Plus size={15} /> Add vehicle
            </Button>
          }
        />

        {vehicles.length === 0 ? (
          <div className="rounded-md border border-dashed border-border p-10 text-center">
            <CarFront size={28} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-semibold">No vehicles yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Add a vehicle to link it to sessions and reservations.
            </p>
            <Button size="sm" className="mt-5" onClick={() => setOpen(true)}>
              <Plus size={15} /> Add your first vehicle
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {vehicles.map(vehicle => (
              <div
                key={vehicle.plate}
                className="panel subtle-shadow flex gap-4 p-4 transition-transform hover:-translate-y-0.5"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-info-soft text-info">
                  {vehicle.type === "Bike" ? <Bike size={23} /> : <CarFront size={23} />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-display text-sm font-bold">{vehicle.plate}</div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {vehicle.model || vehicle.type} &middot; {vehicle.color || "Color not set"}
                  </p>
                  <span className="mt-3 inline-block rounded bg-muted px-2 py-1 text-[10px] font-semibold text-muted-foreground">
                    {vehicle.type}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  title={`Remove ${vehicle.plate}`}
                  aria-label={`Remove ${vehicle.plate}`}
                  onClick={() => removeVehicle(vehicle.plate)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <form
            onSubmit={submit}
            className="w-full max-w-md rounded-md border border-border bg-card p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">Add vehicle</h2>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <X size={18} />
              </Button>
            </div>

            <div className="space-y-4">
              {(
                [
                  { key: "plate", label: "Registration number", placeholder: "TN 38 AB 1234" },
                  { key: "model", label: "Model", placeholder: "e.g. Hyundai i20" },
                  { key: "color", label: "Color", placeholder: "e.g. Silver" },
                ] as const
              ).map(field => (
                <label key={field.key} className="block text-xs font-semibold">
                  {field.label}
                  <input
                    required={field.key === "plate"}
                    value={form[field.key]}
                    onChange={event => setForm({ ...form, [field.key]: event.target.value })}
                    placeholder={field.placeholder}
                    className="surface-input mt-2 h-10 w-full px-3 text-sm font-normal"
                  />
                </label>
              ))}

              <label className="block text-xs font-semibold">
                Vehicle type
                <select
                  value={form.type}
                  onChange={event => setForm({ ...form, type: event.target.value })}
                  className="surface-input mt-2 h-10 w-full px-3 text-sm font-normal"
                >
                  <option>Car</option>
                  <option>Bike</option>
                  <option>SUV</option>
                  <option>Other</option>
                </select>
              </label>

              {error && <p className="text-xs font-semibold text-danger">{error}</p>}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add vehicle</Button>
            </div>
          </form>
        </div>
      )}
    </AppShell>
  );
}