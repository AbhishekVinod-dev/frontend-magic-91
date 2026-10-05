import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  Activity,
  Bell,
  CarFront,
  ChartNoAxesCombined,
  ChevronDown,
  CircleHelp,
  CircleParking,
  Cpu,
  ExternalLink,
  LayoutDashboard,
  Menu,
  ParkingSquare,
  Settings2,
  X,
} from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/overview", label: "Overview", icon: LayoutDashboard },
  { to: "/parking", label: "Parking map", icon: ParkingSquare },
  { to: "/sessions", label: "Sessions", icon: Activity },
  { to: "/vehicles", label: "Vehicles", icon: CarFront },
  { to: "/analytics", label: "Analytics", icon: ChartNoAxesCombined },
  { to: "/devices", label: "Devices", icon: Cpu },
  { to: "/settings", label: "Settings", icon: Settings2 },
] as const;

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <CircleParking size={21} strokeWidth={2.4} />
      </span>
      <span className="font-display text-lg font-bold tracking-tight">
        smartpark<span className="text-primary">.</span>
      </span>
    </span>
  );
}

export function AppShell({
  children,
  title,
  description,
}: {
  children: ReactNode;
  title: string;
  description: string;
}) {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: state => state.location.pathname });

  // Close the mobile drawer whenever navigation happens.
  useEffect(() => setOpen(false), [path]);

  return (
    <div className="min-h-screen bg-background lg:flex">
      {open && (
        <div
          className="fixed inset-0 z-30 bg-ink/50 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-primary-foreground/10 bg-ink text-primary-foreground transition-transform duration-300 ease-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:shrink-0",
          open ? "translate-x-0 shadow-2xl" : "-translate-x-full",
        )}
      >
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-primary-foreground/10 px-6">
          <Link to="/" onClick={() => setOpen(false)}>
            <Wordmark />
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
          <div className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[.18em] text-primary-foreground/40">
            Workspace
          </div>
          <nav className="space-y-1">
            {nav.map(item => {
              const active = path === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-primary-foreground/60 hover:bg-primary-foreground/10 hover:text-primary-foreground",
                  )}
                >
                  <item.icon size={18} strokeWidth={1.8} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="shrink-0 space-y-3 p-4">
          <div className="rounded-md border border-primary-foreground/10 bg-primary-foreground/5 p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold">
              <span className="size-2 shrink-0 rounded-full bg-success status-pulse" />
              All systems operational
            </div>
            <p className="text-xs leading-5 text-primary-foreground/45">
              Parking facility is running normally.
            </p>
          </div>

          <Link
            to="/driver"
            className="flex h-10 items-center justify-between rounded-md px-3 text-sm text-primary-foreground/65 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            <span className="flex items-center gap-3">
              <CarFront size={18} /> Driver view
            </span>
            <ExternalLink size={14} className="text-primary-foreground/40" />
          </Link>

          <div className="flex items-center gap-3 border-t border-primary-foreground/10 px-2 pt-5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              SP
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-semibold">SmartPark Admin</div>
              <div className="truncate text-[11px] text-primary-foreground/45">
                Facility operator
              </div>
            </div>
            <ChevronDown size={15} className="shrink-0 text-primary-foreground/40" />
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-20 shrink-0 items-center justify-between gap-4 border-b border-border bg-card/85 px-5 backdrop-blur-md lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={21} />
            </Button>
            <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
              <span>Workspace</span>
              <span aria-hidden>/</span>
              <span className="truncate font-semibold text-foreground">{title}</span>
            </div>
            <span className="truncate font-display text-base font-bold sm:hidden">{title}</span>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 rounded-md bg-success-soft px-3 py-2 text-xs font-semibold text-success sm:flex">
              <span className="size-1.5 shrink-0 rounded-full bg-success status-pulse" />
              System live
            </div>
            <Link
              to="/devices"
              title="Device status"
              aria-label="Device status"
              className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <CircleHelp size={18} />
            </Link>
            <Link
              to="/sessions"
              title="Activity"
              aria-label="Activity"
              className="relative flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Bell size={18} />
              <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-danger" />
            </Link>
            <span className="ml-1 flex size-9 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-bold text-primary-foreground">
              SP
            </span>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1560px] flex-1 px-5 py-7 lg:px-10 lg:py-9">
          <div className="mb-8">
            <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.15em] text-primary">
              <span className="h-px w-5 bg-primary" />
              SmartPark / Control Center
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
              {title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

export function SectionHeading({ title, aside }: { title: string; aside?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h2 className="font-display text-lg font-bold tracking-tight">{title}</h2>
      {aside}
    </div>
  );
}