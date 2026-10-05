import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Bell,
  CarFront,
  CircleParking,
  Clock3,
  Cpu,
  Gauge,
  IndianRupee,
  MapPin,
  Radio,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/Button";
import { Wordmark } from "@/components/AppShell";
import { useParking } from "@/lib/parking-context";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/")({
  head: () =>
    pageMeta(
      "SmartPark — Smart parking management",
      "SmartPark connects sensors, gates and drivers in one place. Live availability, reservations, analytics and hardware health for modern parking facilities.",
    ),
  component: LandingPage,
});

const features = [
  {
    icon: Radio,
    title: "Live slot availability",
    body: "Every space reports its state in real time, so drivers see exactly where they can park before they arrive.",
  },
  {
    icon: Zap,
    title: "Automatic entry and exit",
    body: "Number-plate recognition opens the gate in under a second and logs the session without any staff involvement.",
  },
  {
    icon: Bell,
    title: "Reservations that hold",
    body: "Reserved bays are protected from walk-ins, with arrival reminders sent before the driver pulls in.",
  },
  {
    icon: BarChart3,
    title: "Revenue and traffic analytics",
    body: "Understand peak hours, dwell time and revenue trends to plan pricing and staffing with confidence.",
  },
  {
    icon: Cpu,
    title: "Hardware health at a glance",
    body: "Controller, gate servo and every sensor report heartbeat status, so faults surface before drivers notice.",
  },
  {
    icon: ShieldCheck,
    title: "Operator and driver views",
    body: "A control centre for facility teams and a focused, mobile-first app for drivers — one system, two experiences.",
  },
];

const steps = [
  {
    step: "01",
    title: "Deploy the hardware",
    body: "Install the ESP32 controller, wire the servo gate and mount per-slot sensors. Setup takes under an hour.",
  },
  {
    step: "02",
    title: "Connect the facility",
    body: "Add your bays, pricing and opening hours. SmartPark builds the live map and driver booking flow for you.",
  },
  {
    step: "03",
    title: "Run the facility",
    body: "Monitor occupancy, sessions and revenue from the control centre while drivers reserve and pay from their phones.",
  },
];

const testimonials = [
  {
    quote:
      "Occupancy used to be a guess. Now the team sees every bay live and peak-hour pricing finally makes sense.",
    name: "Priya Raman",
    role: "Facility Manager, Koramangala",
  },
  {
    quote:
      "Drivers stopped circling for spaces. Reservation to gate entry takes about forty seconds now.",
    name: "Arun Kumar",
    role: "Operations Lead, Anna Nagar",
  },
  {
    quote:
      "The hardware dashboard caught a failing sensor on a Tuesday. That alone paid for the system.",
    name: "Meera Nair",
    role: "Head of Assets, T Nagar",
  },
];

function Stat({
  icon: Icon,
  value,
  label,
  tone,
}: {
  icon: typeof CircleParking;
  value: string;
  label: string;
  tone: string;
}) {
  return (
    <div className="panel subtle-shadow flex items-center gap-4 p-5">
      <span className={`flex size-11 shrink-0 items-center justify-center rounded-md ${tone}`}>
        <Icon size={20} />
      </span>
      <div className="min-w-0">
        <div className="font-display text-2xl font-bold leading-none tabular-nums">{value}</div>
        <div className="mt-1.5 text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

function LandingPage() {
  const { slots, firstHour } = useParking();
  const available = slots.filter(s => s.status === "available").length;
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Site header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-5 lg:px-8">
          <Link to="/" aria-label="SmartPark home">
            <Wordmark />
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
            <a href="#features" className="transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#how" className="transition-colors hover:text-foreground">
              How it works
            </a>
            <a href="#pricing" className="transition-colors hover:text-foreground">
              Pricing
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/driver" className="hidden sm:block">
              <Button variant="ghost" size="sm">
                Driver app
              </Button>
            </Link>
            <Link to="/overview">
              <Button size="sm">
                Operator dashboard <ArrowRight size={15} />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(120%_100%_at_50%_0%,var(--accent)_0%,transparent_65%)] opacity-70"
        />
        <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-16 lg:px-8 lg:pb-24 lg:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-card px-3 py-1.5 text-xs font-semibold text-primary subtle-shadow">
                <Sparkles size={14} />
                ESP32 sensor network &middot; no cloud dependency
              </span>

              <h1 className="mt-6 font-display text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Every parking space,
                <br />
                <span className="text-primary">known in real time.</span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                SmartPark connects your sensors, gate and drivers in one platform. Live
                availability for drivers, occupancy and revenue insight for operators, and
                hardware health you can actually trust.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link to="/driver">
                  <Button className="h-12 px-6 text-[15px]">
                    Find a parking space <ArrowRight size={17} />
                  </Button>
                </Link>
                <Link to="/overview">
                  <Button variant="secondary" className="h-12 px-6 text-[15px]">
                    Explore the control centre
                  </Button>
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-2">
                  <ShieldCheck size={15} className="text-success" />
                  Works offline, syncs when online
                </span>
                <span className="flex items-center gap-2">
                  <Clock3 size={15} className="text-success" />
                  Setup in under an hour
                </span>
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative">
              <div className="panel subtle-shadow overflow-hidden">
                <div className="flex items-center justify-between border-b border-border bg-canvas px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                      <CircleParking size={18} />
                    </span>
                    <div>
                      <div className="text-sm font-bold leading-tight">SmartPark Main Facility</div>
                      <div className="text-[11px] text-muted-foreground">Level 01 &middot; 8 bays</div>
                    </div>
                  </div>
                  <span className="flex items-center gap-2 rounded bg-success-soft px-2.5 py-1.5 text-[11px] font-bold text-success">
                    <span className="size-1.5 rounded-full bg-success status-pulse" />
                    LIVE
                  </span>
                </div>

                <div className="p-5">
                  <div className="mb-4 flex items-end justify-between">
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground">
                        Spaces available
                      </div>
                      <div className="mt-1 font-display text-4xl font-bold leading-none tabular-nums">
                        {available}
                        <span className="text-xl text-muted-foreground"> / {slots.length}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-semibold text-muted-foreground">From</div>
                      <div className="mt-1 font-display text-xl font-bold tabular-nums">
                        &#8377;{firstHour}
                        <span className="text-xs font-medium text-muted-foreground">/hr</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {slots.map(slot => {
                      const tone =
                        slot.status === "available"
                          ? "bg-success-soft border-success/30"
                          : slot.status === "occupied"
                            ? "bg-danger-soft border-danger/25"
                            : slot.status === "reserved"
                              ? "bg-warning-soft border-warning/30"
                              : "bg-muted border-border";
                      const label =
                        slot.status === "available"
                          ? "Free"
                          : slot.status === "occupied"
                            ? "Taken"
                            : slot.status === "reserved"
                              ? "Held"
                              : "Service";
                      const text =
                        slot.status === "available"
                          ? "text-success"
                          : slot.status === "occupied"
                            ? "text-danger"
                            : slot.status === "reserved"
                              ? "text-warning"
                              : "text-muted-foreground";
                      return (
                        <div
                          key={slot.id}
                          className={`flex flex-col items-center justify-center rounded-md border py-3 ${tone}`}
                        >
                          <CarFront
                            size={16}
                            className={`mb-1.5 ${text} ${slot.status === "available" ? "opacity-40" : ""}`}
                          />
                          <span className="font-display text-xs font-bold text-foreground">
                            {slot.id}
                          </span>
                          <span className={`text-[10px] font-semibold ${text}`}>{label}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2 border-t border-border pt-4 text-center">
                    <div>
                      <Radio size={14} className="mx-auto mb-1 text-success" />
                      <div className="text-[11px] text-muted-foreground">Sensors</div>
                      <div className="text-xs font-bold">10/10</div>
                    </div>
                    <div>
                      <Gauge size={14} className="mx-auto mb-1 text-success" />
                      <div className="text-[11px] text-muted-foreground">Gate</div>
                      <div className="text-xs font-bold">Open</div>
                    </div>
                    <div>
                      <IndianRupee size={14} className="mx-auto mb-1 text-info" />
                      <div className="text-[11px] text-muted-foreground">Today</div>
                      <div className="text-xs font-bold tabular-nums">&#8377;12,450</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="panel subtle-shadow absolute -bottom-6 -left-4 hidden w-52 p-4 sm:block">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-success">
                  <span className="size-1.5 rounded-full bg-success status-pulse" />
                  Entry detected
                </div>
                <div className="mt-2 font-display text-sm font-bold">TN 38 AB 1234</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">
                  Gate opened &middot; bay S02
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              icon={CircleParking}
              value="8"
              label="Live bays on this floor"
              tone="bg-info-soft text-info"
            />
            <Stat
              icon={Gauge}
              value="0.9s"
              label="Average gate response"
              tone="bg-success-soft text-success"
            />
            <Stat
              icon={IndianRupee}
              value="&#8377;12,450"
              label="Revenue collected today"
              tone="bg-warning-soft text-warning"
            />
            <Stat
              icon={Cpu}
              value="10/10"
              label="Sensors reporting"
              tone="bg-danger-soft text-danger"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.15em] text-primary">
              <span className="h-px w-5 bg-primary" />
              What you get
            </div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
              One system for the whole facility
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Everything from the gate to the revenue report, built on the same live data &mdash;
              no integrations to stitch together.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map(feature => (
              <div
                key={feature.title}
                className="panel subtle-shadow card-lift p-6"
              >
                <span className="flex size-11 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <feature.icon size={21} />
                </span>
                <h3 className="mt-5 font-display text-lg font-bold tracking-tight">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-t border-border">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.15em] text-primary">
              <span className="h-px w-5 bg-primary" />
              How it works
            </div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
              Live in three steps
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Most facilities are running before the end of the day.
            </p>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {steps.map(item => (
              <div key={item.step} className="panel subtle-shadow card-lift relative p-6 lg:p-7">
                <span className="font-display text-4xl font-bold text-primary/25">
                  {item.step}
                </span>
                <h3 className="mt-4 font-display text-lg font-bold tracking-tight">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Views split */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col justify-center">
              <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.15em] text-primary">
                <span className="h-px w-5 bg-primary" />
                For operators
              </div>
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground">
                A control centre your team will actually use
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                Occupancy, live sessions, slot management and hardware health on a single
                screen &mdash; built for the person running the gate during the morning rush.
              </p>
              <ul className="mt-7 space-y-3">
                {[
                  "Live floor plan with per-bay status and filters",
                  "Session log with entry, exit, duration and fee",
                  "Revenue, traffic and peak occupancy analytics",
                  "Controller, gate and per-sensor health monitoring",
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-foreground">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-success-soft text-success">
                      <ShieldCheck size={13} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/overview" className="mt-8 inline-block">
                <Button>
                  Open the dashboard <ArrowRight size={16} />
                </Button>
              </Link>
            </div>

            <div className="flex flex-col justify-center">
              <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.15em] text-primary">
                <span className="h-px w-5 bg-primary" />
                For drivers
              </div>
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground">
                No more circling the block
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                Drivers check availability, reserve a bay and know the fee before they set off.
                Mobile-first, and it works even when the signal is poor.
              </p>
              <ul className="mt-7 space-y-3">
                {[
                  "Real-time bay map with one-tap selection",
                  "Reserve a specific space for a chosen arrival time",
                  "Upfront fee estimate with a clear per-hour breakdown",
                  "Parking history and saved vehicles in one profile",
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-foreground">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-info-soft text-info">
                      <ShieldCheck size={13} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/driver" className="mt-8 inline-block">
                <Button variant="secondary">
                  See the driver view <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-border">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-3 flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[.15em] text-primary">
              <span className="h-px w-5 bg-primary" />
              Pricing
              <span className="h-px w-5 bg-primary" />
            </div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
              Priced per bay, not per headache
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Start with a single floor and scale when you are ready. Every plan includes the
              driver app and hardware monitoring.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-5xl gap-5 lg:grid-cols-3">
            {[
              {
                name: "Starter",
                price: "₹1,200",
                unit: "per bay / month",
                body: "For single-floor facilities getting started.",
                features: ["Live availability map", "Driver reservations", "Session log", "Email support"],
                cta: "Start with Starter",
                href: "/overview",
                featured: false,
              },
              {
                name: "Facility",
                price: "₹2,400",
                unit: "per bay / month",
                body: "For multi-level facilities running daily traffic.",
                features: [
                  "Everything in Starter",
                  "Revenue & traffic analytics",
                  "Hardware health monitoring",
                  "Priority support",
                ],
                cta: "Choose Facility",
                href: "/overview",
                featured: true,
              },
              {
                name: "Enterprise",
                price: "Custom",
                unit: "multi-site",
                body: "For operators running several locations.",
                features: [
                  "Everything in Facility",
                  "Multi-site dashboard",
                  "Custom integrations",
                  "Dedicated engineer",
                ],
                cta: "Talk to us",
                href: "/overview",
                featured: false,
              },
            ].map(plan => (
              <div
                key={plan.name}
                className={
                  plan.featured
                    ? "relative flex flex-col rounded-md border border-primary bg-card p-6 shadow-xl shadow-primary/10 lg:p-7"
                    : "panel subtle-shadow flex flex-col p-6 lg:p-7"
                }
              >
                {plan.featured && (
                  <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
                    Most popular
                  </span>
                )}
                <h3 className="font-display text-lg font-bold tracking-tight">{plan.name}</h3>
                <p className="mt-1.5 text-xs text-muted-foreground">{plan.body}</p>
                <div className="mt-6 flex items-baseline gap-1.5">
                  <span className="font-display text-3xl font-bold tabular-nums">{plan.price}</span>
                  <span className="text-xs text-muted-foreground">{plan.unit}</span>
                </div>
                <ul className="mt-6 flex-1 space-y-2.5">
                  {plan.features.map(item => (
                    <li key={item} className="flex items-start gap-2.5 text-sm">
                      <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-success-soft text-success">
                        <ShieldCheck size={11} />
                      </span>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link to={plan.href} className="mt-7 block">
                  <Button
                    variant={plan.featured ? "primary" : "secondary"}
                    className="h-11 w-full"
                  >
                    {plan.cta} <ArrowRight size={16} />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
          <div className="grid gap-5 lg:grid-cols-3">
            {testimonials.map(item => (
              <figure key={item.name} className="panel subtle-shadow card-lift flex flex-col p-6">
                <p className="flex-1 text-sm leading-relaxed text-foreground">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-bold text-primary-foreground">
                    {item.name
                      .split(" ")
                      .map(part => part[0])
                      .join("")}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{item.name}</div>
                    <div className="truncate text-[11px] text-muted-foreground">{item.role}</div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
          <div className="relative overflow-hidden rounded-md bg-ink p-8 text-primary-foreground sm:p-12 lg:p-16">
            <CircleParking
              size={420}
              strokeWidth={0.5}
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-24 text-primary-foreground/5"
            />
            <div className="relative max-w-2xl">
              <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.16em] text-primary">
                <Sparkles size={13} />
                Get started
              </div>
              <h2 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                Know where every car is parked.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-primary-foreground/60">
                Explore the operator dashboard or the driver view &mdash; both are live in this
                preview, no signup required.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link to="/overview">
                  <Button className="h-12 px-6 text-[15px]">
                    Open the dashboard <ArrowRight size={17} />
                  </Button>
                </Link>
                <Link to="/driver">
                  <Button
                    variant="ghost"
                    className="h-12 border border-primary-foreground/25 px-6 text-[15px] text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  >
                    Try the driver app
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter / footer CTA */}
      <section className="border-t border-border bg-canvas">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight">
                Get facility updates
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Occasional notes on pricing, hardware and new features. No noise.
              </p>
            </div>
            <form
              onSubmit={event => {
                event.preventDefault();
                if (!email.trim()) return;
                setSubmitted(true);
                setEmail("");
              }}
              className="flex w-full max-w-md gap-2"
            >
              <label htmlFor="landing-email" className="sr-only">
                Work email
              </label>
              <input
                id="landing-email"
                type="email"
                required
                value={email}
                onChange={event => setEmail(event.target.value)}
                placeholder="you@company.com"
                className="surface-input h-11 flex-1 px-4 text-sm"
              />
              <Button type="submit" className="h-11 shrink-0">
                {submitted ? "Subscribed" : "Subscribe"}
              </Button>
            </form>
          </div>
          {submitted && (
            <p role="status" className="mt-3 text-xs text-success">
              Thanks &mdash; you are on the list.
            </p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <Link to="/" aria-label="SmartPark home">
                <Wordmark />
              </Link>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
                Live parking management for operators and drivers, powered by low-cost sensors.
              </p>
              <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin size={14} />
                Chennai, India
              </div>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">
                Product
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                <li>
                  <a href="#features" className="transition-colors hover:text-foreground">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="transition-colors hover:text-foreground">
                    Pricing
                  </a>
                </li>
                <li>
                  <Link to="/overview" className="transition-colors hover:text-foreground">
                    Control centre
                  </Link>
                </li>
                <li>
                  <Link to="/driver" className="transition-colors hover:text-foreground">
                    Driver app
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">
                Company
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                <li>
                  <a href="#how" className="transition-colors hover:text-foreground">
                    How it works
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="transition-colors hover:text-foreground">
                    Contact sales
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">
                Contact
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                <li>hello@smartpark.example</li>
                <li>+91 44 4000 1234</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-border pt-7 sm:flex-row sm:items-center">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} SmartPark. Demo interface &mdash; sample data only.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-success status-pulse" />
              All systems operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}