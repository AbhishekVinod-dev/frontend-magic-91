import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Activity, Bell, CarFront, ChartNoAxesCombined, ChevronDown, CircleHelp, CircleParking, Cpu, LayoutDashboard, Menu, ParkingSquare, Settings2, X } from "lucide-react";
import { Button } from "./Button";

const nav = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/parking", label: "Parking map", icon: ParkingSquare },
  { to: "/sessions", label: "Sessions", icon: Activity },
  { to: "/vehicles", label: "Vehicles", icon: CarFront },
  { to: "/analytics", label: "Analytics", icon: ChartNoAxesCombined },
  { to: "/devices", label: "Devices", icon: Cpu },
  { to: "/settings", label: "Settings", icon: Settings2 },
] as const;
export function AppShell({ children, title, description }: { children: ReactNode; title: string; description: string }) {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: state => state.location.pathname });
  return <div className="min-h-screen bg-background lg:flex">
    {open && <div className="fixed inset-0 z-30 bg-ink/40 lg:hidden" onClick={() => setOpen(false)} />}
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-ink text-primary-foreground transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex h-20 items-center justify-between border-b border-primary-foreground/10 px-6">
        <Link to="/" onClick={() => setOpen(false)} className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-md bg-primary"><CircleParking size={23} strokeWidth={2.5} /></span><span className="font-display text-xl font-bold">smartpark<span className="text-primary">.</span></span></Link>
        <Button variant="ghost" size="icon" className="text-primary-foreground lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><X size={18}/></Button>
      </div>
      <div className="px-4 pt-8"><div className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[.18em] text-primary-foreground/40">Workspace</div><nav className="space-y-1">{nav.map(item => <Link key={item.to} to={item.to} onClick={() => setOpen(false)} className={`flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors ${path === item.to ? "bg-primary text-primary-foreground" : "text-primary-foreground/60 hover:bg-primary-foreground/10 hover:text-primary-foreground"}`}><item.icon size={18} strokeWidth={1.8}/>{item.label}</Link>)}</nav></div>
      <div className="mt-auto p-4"><div className="mb-4 rounded-md border border-primary-foreground/10 bg-primary-foreground/5 p-4"><div className="mb-2 flex items-center gap-2 text-xs font-semibold"><span className="size-2 rounded-full bg-success status-pulse"/> All systems operational</div><p className="text-xs leading-5 text-primary-foreground/45">Parking facility is running normally.</p></div><Link to="/driver" className="flex h-10 items-center justify-between rounded-md px-3 text-sm text-primary-foreground/65 hover:bg-primary-foreground/10 hover:text-primary-foreground"><span className="flex items-center gap-3"><CarFront size={18}/> Driver view</span><span>↗</span></Link><div className="mt-3 flex items-center gap-3 border-t border-primary-foreground/10 px-2 pt-5"><span className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-bold">SP</span><div className="min-w-0 flex-1"><div className="text-xs font-semibold">SmartPark Admin</div><div className="text-[11px] text-primary-foreground/45">Facility operator</div></div><ChevronDown size={15} className="text-primary-foreground/40"/></div></div>
    </aside>
    <div className="min-w-0 flex-1"><header className="flex h-20 items-center justify-between border-b border-border bg-card px-5 lg:px-10"><div className="flex items-center gap-3"><Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={21}/></Button><div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex"><span>Workspace</span><span>/</span><span className="font-semibold text-foreground">{title}</span></div><span className="font-display text-base font-bold sm:hidden">{title}</span></div><div className="flex items-center gap-3"><div className="hidden items-center gap-2 rounded-md bg-success-soft px-3 py-2 text-xs font-semibold text-success sm:flex"><span className="size-1.5 rounded-full bg-success status-pulse"/> System live</div><Link to="/devices" title="Device status" className="flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"><CircleHelp size={18}/></Link><Link to="/sessions" title="Activity" className="relative flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"><Bell size={18}/><span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-danger"/></Link><span className="ml-1 flex size-9 items-center justify-center rounded-full bg-ink text-xs font-bold text-primary-foreground">SP</span></div></header><main className="mx-auto max-w-[1560px] px-5 py-7 lg:px-10 lg:py-9"><div className="mb-8"><div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.15em] text-primary"><span className="h-px w-5 bg-primary"/> SMARTPARK / CONTROL CENTER</div><h1 className="font-display text-3xl font-bold text-foreground lg:text-4xl">{title}</h1><p className="mt-2 text-sm text-muted-foreground">{description}</p></div>{children}</main></div>
  </div>;
}
export function SectionHeading({ title, aside }: { title: string; aside?: ReactNode }) { return <div className="mb-5 flex items-center justify-between gap-3"><h2 className="font-display text-lg font-bold">{title}</h2>{aside}</div>; }
