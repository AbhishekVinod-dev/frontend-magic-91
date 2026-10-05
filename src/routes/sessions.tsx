import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Clock3, Search } from "lucide-react";
import { AppShell, SectionHeading } from "@/components/AppShell";
import { ActivityList } from "@/components/ActivityList";
import { Button } from "@/components/Button";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/sessions")({
  head: () =>
    pageMeta("Sessions & activity", "Review parking sessions and recent facility activity."),
  component: SessionsPage,
});

const sessions = [
  {
    plate: "TN 38 AB 1234",
    slot: "S02",
    entry: "10:32 AM",
    exit: "In progress",
    duration: "1h 24m",
    fee: "₹130",
    status: "Active",
  },
  {
    plate: "TN 01 XY 5678",
    slot: "S04",
    entry: "09:48 AM",
    exit: "In progress",
    duration: "2h 08m",
    fee: "₹130",
    status: "Active",
  },
  {
    plate: "TN 09 CD 4021",
    slot: "S03",
    entry: "08:30 AM",
    exit: "10:12 AM",
    duration: "1h 42m",
    fee: "₹130",
    status: "Completed",
  },
  {
    plate: "TN 42 KL 9102",
    slot: "S01",
    entry: "07:15 AM",
    exit: "09:02 AM",
    duration: "1h 47m",
    fee: "₹130",
    status: "Completed",
  },
];

const tabs = ["All sessions", "Active", "Completed"] as const;

const summaries = [
  { label: "Active sessions", value: "02", icon: Clock3, color: "text-success bg-success-soft" },
  { label: "Entries today", value: "27", icon: ArrowDownLeft, color: "text-info bg-info-soft" },
  { label: "Exits today", value: "25", icon: ArrowUpRight, color: "text-warning bg-warning-soft" },
];

function SessionsPage() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<(typeof tabs)[number]>("All sessions");

  const shown = sessions.filter(
    session =>
      (tab === "All sessions" || session.status === tab) &&
      session.plate.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <AppShell
      title="Sessions & activity"
      description="Track vehicle movements and parking sessions in one place."
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {summaries.map(item => (
          <div key={item.label} className="panel subtle-shadow flex items-center gap-4 p-5">
            <span
              className={`flex size-11 shrink-0 items-center justify-center rounded-md ${item.color}`}
            >
              <item.icon size={20} />
            </span>
            <div>
              <div className="text-xs text-muted-foreground">{item.label}</div>
              <div className="font-display text-2xl font-bold tabular-nums">{item.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
        <section className="panel overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold tracking-tight">Parking sessions</h2>
            <label className="surface-input flex h-9 items-center gap-2 px-3 text-muted-foreground">
              <Search size={15} />
              <input
                aria-label="Search vehicle plate"
                placeholder="Search plate number"
                value={query}
                onChange={event => setQuery(event.target.value)}
                className="w-40 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-2 border-b border-border px-5 pb-4 sm:px-6">
            {tabs.map(item => (
              <Button
                key={item}
                variant={tab === item ? "dark" : "secondary"}
                size="sm"
                onClick={() => setTab(item)}
              >
                {item}
              </Button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-xs">
              <thead className="bg-canvas text-muted-foreground">
                <tr>
                  {["Vehicle", "Slot", "Entry", "Exit", "Duration", "Fee", "Status"].map(
                    heading => (
                      <th key={heading} className="px-5 py-3 font-semibold uppercase">
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {shown.map(session => (
                  <tr key={session.plate} className="transition-colors hover:bg-canvas/60">
                    <td className="px-5 py-4 font-bold">{session.plate}</td>
                    <td className="px-5 py-4">{session.slot}</td>
                    <td className="px-5 py-4 text-muted-foreground">{session.entry}</td>
                    <td className="px-5 py-4 text-muted-foreground">{session.exit}</td>
                    <td className="px-5 py-4 tabular-nums">{session.duration}</td>
                    <td className="px-5 py-4 font-bold tabular-nums">{session.fee}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded px-2 py-1 font-semibold ${
                          session.status === "Active"
                            ? "bg-success-soft text-success"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {session.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {shown.length === 0 && (
              <p className="p-8 text-center text-sm text-muted-foreground">
                No sessions match your search.
              </p>
            )}
          </div>
        </section>

        <section className="panel h-fit p-5 sm:p-6">
          <SectionHeading title="Recent events" />
          <ActivityList />
        </section>
      </div>
    </AppShell>
  );
}