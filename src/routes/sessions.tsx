import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Clock3, Search } from "lucide-react";
import { AppShell, SectionHeading } from "@/components/AppShell";
import { ActivityList } from "@/components/ActivityList";
import { Button } from "@/components/Button";
import { useParking } from "@/lib/parking-context";
import { formatDuration, sessionFee, sessionMinutes } from "@/lib/sessions";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/sessions")({
  head: () =>
    pageMeta(
      "Sessions & activity",
      "Review parking sessions with live arrival and departure times.",
    ),
  component: SessionsPage,
});

const tabs = ["All sessions", "Active", "Completed"] as const;

function SessionsPage() {
  const { sessions, firstHour, extraHour, dailyMax, liveFeed } = useParking();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<(typeof tabs)[number]>("All sessions");

  const rates = { firstHour, extraHour, dailyMax };

  const shown = sessions.filter(
    (session) =>
      (tab === "All sessions" || session.status === tab) &&
      session.plate.toLowerCase().includes(query.toLowerCase()),
  );

  const summaries = [
    {
      label: "Active sessions",
      value: sessions.filter((session) => session.status === "Active").length,
      icon: Clock3,
      color: "text-success bg-success-soft",
    },
    {
      label: "Arrivals logged",
      value: sessions.filter((session) => session.arrival !== "—").length,
      icon: ArrowDownLeft,
      color: "text-info bg-info-soft",
    },
    {
      label: "Departures logged",
      value: sessions.filter((session) => session.departure).length,
      icon: ArrowUpRight,
      color: "text-warning bg-warning-soft",
    },
  ];

  return (
    <AppShell
      title="Sessions & activity"
      description="Arrival and departure times are stamped the moment a vehicle comes or goes."
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {summaries.map((item) => (
          <div key={item.label} className="panel subtle-shadow flex items-center gap-4 p-5">
            <span
              className={`flex size-11 shrink-0 items-center justify-center rounded-md ${item.color}`}
            >
              <item.icon size={20} />
            </span>
            <div>
              <div className="text-xs text-muted-foreground">{item.label}</div>
              <div className="font-display text-2xl font-bold tabular-nums">
                {String(item.value).padStart(2, "0")}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
        <section className="panel overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
            <div>
              <h2 className="font-display text-lg font-bold tracking-tight">Parking sessions</h2>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="size-1.5 rounded-full bg-success status-pulse" />
                {liveFeed.receiving
                  ? "Timestamps update live from the controller"
                  : "Timestamps update live as bays change"}
              </p>
            </div>
            <label className="surface-input flex h-9 items-center gap-2 px-3 text-muted-foreground">
              <Search size={15} />
              <input
                aria-label="Search vehicle plate"
                placeholder="Search plate number"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-40 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-2 border-b border-border px-5 pb-4 sm:px-6">
            {tabs.map((item) => (
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
            <table className="w-full min-w-[700px] text-left text-xs">
              <thead className="bg-canvas text-muted-foreground">
                <tr>
                  {["Vehicle", "Slot", "Arrival", "Departure", "Duration", "Fee", "Status"].map(
                    (heading) => (
                      <th key={heading} className="px-5 py-3 font-semibold uppercase">
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {shown.map((session) => {
                  const fee = sessionFee(session, rates);
                  return (
                    <tr key={session.id} className="transition-colors hover:bg-canvas/60">
                      <td className="px-5 py-4 font-bold">{session.plate}</td>
                      <td className="px-5 py-4">{session.slot}</td>
                      <td className="px-5 py-4 font-mono tabular-nums">
                        {session.arrival === "—" ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          session.arrival
                        )}
                      </td>
                      <td className="px-5 py-4 font-mono tabular-nums">
                        {session.departure ? (
                          session.departure
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-success">
                            <span className="size-1.5 rounded-full bg-success status-pulse" />
                            In progress
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 tabular-nums">
                        {formatDuration(sessionMinutes(session))}
                      </td>
                      <td className="px-5 py-4 font-bold tabular-nums">
                        {fee === null ? "—" : `₹${fee}`}
                      </td>
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
                  );
                })}
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
