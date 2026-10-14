import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  CarFront,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  CircleParking,
  Clock3,
  Cpu,
  DoorOpen,
  Gauge,
  HelpCircle,
  IndianRupee,
  Layers,
  MapPin,
  Maximize2,
  Menu,
  Navigation,
  QrCode,
  Radio,
  RotateCcw,
  ShieldCheck,
  Sliders,
  Smartphone,
  Sparkles,
  Star,
  Timer,
  TrendingUp,
  Wifi,
  X,
  Zap,
} from "lucide-react";
import { useState, useId } from "react";
import { Button } from "@/components/Button";
import { Wordmark } from "@/components/AppShell";
import { useParking, type Slot } from "@/lib/parking-context";
import { clockTime, latestSession } from "@/lib/sessions";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/")({
  head: () =>
    pageMeta(
      "SmartPark — Next-Gen IoT Parking Management",
      "SmartPark connects ESP32 microcontrollers, ultrasonic sensors, automated barrier gates, and mobile driver reservations in real time. Zero hardware friction, zero revenue loss.",
    ),
  component: LandingPage,
});

/* -------------------------------------------------------------------------- */
/* Static Data & Configurations                                               */
/* -------------------------------------------------------------------------- */

const navLinks = [
  { href: "#simulator", label: "Live Simulator" },
  { href: "#architecture", label: "IoT Architecture" },
  { href: "#showcase", label: "Dual Experience" },
  { href: "#calculator", label: "ROI Calculator" },
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
] as const;

const coreFeatures = [
  {
    icon: Radio,
    badge: "50ms Telemetry",
    title: "Real-Time Sensor Grid",
    description:
      "Per-bay ultrasonic and IR sensors update millisecond occupancy states across all floors. Drivers see exact open spaces before turning the corner.",
    tag: "Ultrasonic + IR",
  },
  {
    icon: Zap,
    badge: "Autonomous",
    title: "Intelligent Barrier Automation",
    description:
      "High-precision servo barrier gates open automatically on vehicle detection. Digital ticket timestamps sync directly with cloud billing ledgers.",
    tag: "PWM Servo Control",
  },
  {
    icon: Bell,
    badge: "Anti-Conflict",
    title: "Guaranteed Spot Reservations",
    description:
      "Pre-booked bays lock out unauthorized parking with live LED indicators and countdown grace periods. Completely eliminates parking disputes.",
    tag: "Mobile Pass",
  },
  {
    icon: BarChart3,
    badge: "Yield Optimization",
    title: "Revenue & Dwell Analytics",
    description:
      "Visualize peak occupancy hours, turnover velocity, uncollected revenue leaks, and surge pricing opportunities to maximize lot yield.",
    tag: "Dynamic Pricing",
  },
  {
    icon: Cpu,
    badge: "Edge Reliability",
    title: "Hardware Health & Self-Healing",
    description:
      "Continuous heartbeat monitoring for ESP32 nodes, gate drivers, and sensor pins. Instant automated alerts before hardware degrades driver flow.",
    tag: "MQTT / Realtime",
  },
  {
    icon: Smartphone,
    badge: "Zero-Install PWA",
    title: "Frictionless Driver Experience",
    description:
      "Mobile web application with instant upfront pricing, turn-by-turn facility navigation, and one-tap UPI/FASTag integration. No app store download needed.",
    tag: "Instant Web Access",
  },
];

const hardwareSteps = [
  {
    number: "01",
    title: "Per-Bay Sensor Nodes",
    subtitle: "Ultrasonic & IR Detection",
    description:
      "Durable optical and distance sensors mounted above or inside each parking bay continuously measure vehicle presence with sub-centimeter accuracy.",
    icon: Radio,
    statusText: "50ms polling cycle",
  },
  {
    number: "02",
    title: "ESP32 Edge Microcontroller",
    subtitle: "Local Logic & Offline Fallback",
    description:
      "Processes sensor inputs locally at the facility gate, drives PWM servo motors, and transmits telemetry packets securely over WiFi and WebSockets.",
    icon: Cpu,
    statusText: "Autonomous edge failover",
  },
  {
    number: "03",
    title: "Realtime Cloud Sync",
    subtitle: "Supabase & WebSocket Mesh",
    description:
      "State transitions broadcast instantly to operator control desks and mobile driver screens without manual refresh or server polling overhead.",
    icon: Wifi,
    statusText: "< 80ms cloud latency",
  },
  {
    number: "04",
    title: "Autonomous Driver Flow",
    subtitle: "Gate Clearance & Billing",
    description:
      "Drivers approach, barrier gate raises smoothly, bay status shifts to Occupied, and automated session timestamps begin for seamless payment.",
    icon: Gauge,
    statusText: "100% automated check-in",
  },
];

const testimonials = [
  {
    quote:
      "We eliminated parking queues completely during Friday evening rushes. Our turnover increased by 38% and unauthorized parking dropped to zero.",
    name: "Priya Raman",
    role: "Director of Facilities",
    facility: "Phoenix Tech Park, Bengaluru",
    stats: "+38% Turnover",
    rating: 5,
  },
  {
    quote:
      "The hardware reliability is astonishing. The ESP32 telemetry caught a sensor wire looseness before morning shift started. Saved us hours of chaos.",
    name: "Arun Kumar",
    role: "Operations Head",
    facility: "Grand Galleria Mall, Chennai",
    stats: "99.98% Uptime",
    rating: 5,
  },
  {
    quote:
      "Drivers love opening the web link and reserving their bay in 5 seconds. We don't need manual ticket attendants at the basement gate anymore.",
    name: "Meera Nair",
    role: "Property Manager",
    facility: "Cyber Towers Business Hub, Hyderabad",
    stats: "₹1.4L Saved/Month",
    rating: 5,
  },
];

const faqs = [
  {
    q: "What happens if the parking lot loses internet connectivity?",
    a: "The ESP32 controller operates autonomously at the local hardware level. The servo gate continues detecting vehicles and maintaining local bay state in firmware memory. Once the network reconnects, all buffered timestamps automatically synchronize with the cloud database.",
  },
  {
    q: "Do drivers need to download an application from the App Store or Play Store?",
    a: "No! SmartPark provides a lightning-fast Progressive Web App (PWA). Drivers can scan a QR code at your entrance or visit your custom facility link to check live spaces, reserve a spot, and pay fees instantly on any smartphone browser.",
  },
  {
    q: "How long does physical hardware installation take?",
    a: "A standard 8 to 20-bay floor typically takes under 2 hours to wire and test. The ESP32 controller connects to standard 5V power and per-slot IR/ultrasonic sensor cables with simple screw terminals.",
  },
  {
    q: "Can we configure dynamic pricing and free grace periods?",
    a: "Yes. Operators have total control over first-hour rates, subsequent hour increments, daily caps, and grace periods (e.g., 15 minutes free for quick drop-offs). Rates can be updated live from the Settings page.",
  },
  {
    q: "Can SmartPark integrate with existing boom barriers or RFID gates?",
    a: "Yes. While SmartPark supports direct PWM servo gates natively, the ESP32 GPIO relay output can trigger standard dry-contact commercial barrier gates and industrial loop detectors.",
  },
];

/* -------------------------------------------------------------------------- */
/* Main Component                                                             */
/* -------------------------------------------------------------------------- */

function LandingPage() {
  const { slots, updateSlot, firstHour, extraHour, dailyMax, sessions, gate, setGate } = useParking();

  // Interactive Hero Simulator States
  const [selectedSlotId, setSelectedSlotId] = useState<string>("S01");
  const [lastActivityMessage, setLastActivityMessage] = useState<string>(
    "ESP32 Telemetry online · 8 bays reporting active",
  );

  // ROI Calculator States
  const [calcBays, setCalcBays] = useState<number>(30);
  const [calcTurnover, setCalcTurnover] = useState<number>(4);
  const [calcRate, setCalcRate] = useState<number>(30);

  // Pricing Billing Toggle
  const [annualBilling, setAnnualBilling] = useState<boolean>(true);

  // Showcase Active Tab
  const [showcaseTab, setShowcaseTab] = useState<"operator" | "driver">("operator");

  // FAQ Accordion State
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Newsletter State
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  // Mobile navigation drawer
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Derived metrics from live context
  const availableCount = slots.filter((s) => s.status === "available").length;
  const occupiedCount = slots.filter((s) => s.status === "occupied").length;
  const reservedCount = slots.filter((s) => s.status === "reserved").length;
  const occupancyPercentage = Math.round((occupiedCount / slots.length) * 100);

  // Current selected slot object
  const currentSlot = slots.find((s) => s.id === selectedSlotId) || slots[0];
  const currentSession = currentSlot ? latestSession(sessions, currentSlot.id) : undefined;

  // Simulator actions
  const triggerGateEntry = () => {
    if (gate !== "CLOSED") return;
    setGate("OPENING");
    setLastActivityMessage("Proximity sensor triggered · Vehicle detected at Entrance Gate");

    setTimeout(() => {
      setGate("OPEN");
      setLastActivityMessage(
        `Servo Gate OPEN (90°) · Vehicle TN 38 AB 1234 entering bay · Arrived ${clockTime()}`,
      );

      // Auto assign first available bay if any
      const freeSlot = slots.find((s) => s.status === "available");
      if (freeSlot) {
        updateSlot(freeSlot.id, "occupied");
        setSelectedSlotId(freeSlot.id);
      }

      setTimeout(() => {
        setGate("CLOSED");
        setLastActivityMessage("Vehicle cleared entry beam · Servo Gate CLOSED (0°)");
      }, 3200);
    }, 1000);
  };

  const handleToggleSlotStatus = (slotId: string) => {
    const target = slots.find((s) => s.id === slotId);
    if (!target) return;

    if (target.status === "available") {
      updateSlot(slotId, "occupied");
      setLastActivityMessage(`Bay ${slotId} sensor beam broken · Arrived ${clockTime()}`);
    } else if (target.status === "occupied") {
      updateSlot(slotId, "available");
      setLastActivityMessage(`Bay ${slotId} vehicle departed · Departed ${clockTime()}`);
    } else if (target.status === "reserved") {
      updateSlot(slotId, "occupied");
      setLastActivityMessage(`Reserved driver parked in Bay ${slotId} · Arrived ${clockTime()}`);
    } else {
      updateSlot(slotId, "available");
      setLastActivityMessage(`Maintenance completed on Bay ${slotId} · State -> AVAILABLE`);
    }
  };

  // ROI Computations
  const dailyCars = calcBays * calcTurnover;
  const dailyGross = dailyCars * (calcRate * 2.5); // avg 2.5 hours dwell
  const monthlyGross = Math.round(dailyGross * 30);
  const leakagePrevented = Math.round(monthlyGross * 0.16); // ~16% revenue leakage prevention

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Subtle Background Circuit & Radial Glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 bg-grid-pattern opacity-60"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed -top-40 left-1/2 -z-10 h-[640px] w-[1000px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,oklch(0.63_0.14_165/18%),transparent_65%)] blur-3xl"
      />

      {/* -------------------------------------------------------------------- */}
      {/* Sticky Frosted Header                                               */}
      {/* -------------------------------------------------------------------- */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" aria-label="SmartPark Home" className="flex shrink-0 items-center gap-3">
            <Wordmark />
          </Link>

          <nav
            aria-label="Main Navigation"
            className="hidden items-center gap-8 text-sm font-medium text-muted-foreground lg:flex"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link to="/driver">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Smartphone size={15} />
                Driver App
              </Button>
            </Link>

            <Link to="/overview">
              <Button size="sm" className="shadow-md shadow-primary/20">
                <span className="hidden sm:inline">Operator Console</span>
                <span className="sm:hidden">Console</span>
                <ArrowRight size={15} />
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileNavOpen((open) => !open)}
              aria-label={mobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileNavOpen}
            >
              {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>

        {mobileNavOpen && (
          <nav
            aria-label="Mobile Navigation"
            className="border-t border-border/70 bg-background/95 backdrop-blur-xl lg:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileNavOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
              <Link
                to="/driver"
                onClick={() => setMobileNavOpen(false)}
                className="mt-1 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:hidden"
              >
                Driver App
              </Link>
            </div>
          </nav>
        )}
      </header>

      <main>
        {/* ------------------------------------------------------------------ */}
        {/* HERO SECTION                                                       */}
        {/* ------------------------------------------------------------------ */}
        <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
              {/* Hero Copy */}
              <div className="lg:col-span-6 xl:col-span-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
                  <Sparkles size={14} className="animate-spin text-primary" style={{ animationDuration: "6s" }} />
                  <span>Next-Generation Automated Parking OS</span>
                </div>

                <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl lg:leading-[1.12]">
                  Autonomous Parking,{" "}
                  <span className="bg-gradient-to-r from-primary via-emerald-500 to-teal-400 bg-clip-text text-transparent">
                    Powered by Real-Time IoT Telemetry.
                  </span>
                </h1>

                <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Bridge the physical and digital divide. SmartPark connects ESP32 microcontrollers,
                  per-bay ultrasonic sensors, automated barrier gates, and smartphone reservations
                  into a unified sub-second command center.
                </p>

                {/* Primary Action Group */}
                <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
                  <Link to="/overview">
                    <Button className="h-12 px-7 text-sm font-bold shadow-lg shadow-primary/25">
                      Launch Operator Suite
                      <ArrowRight size={17} />
                    </Button>
                  </Link>
                  <Link to="/driver">
                    <Button
                      variant="secondary"
                      className="h-12 border border-border px-6 text-sm font-semibold"
                    >
                      <Smartphone size={16} />
                      Test Driver Booking
                    </Button>
                  </Link>
                </div>

                {/* Micro Assurance Metrics */}
                <div className="mt-10 grid grid-cols-3 gap-3 border-t border-border/70 pt-6">
                  <div>
                    <div className="font-display text-xl font-bold text-foreground sm:text-2xl">
                      &lt; 0.9s
                    </div>
                    <div className="text-xs text-muted-foreground">Servo Gate Speed</div>
                  </div>
                  <div>
                    <div className="font-display text-xl font-bold text-foreground sm:text-2xl">
                      99.98%
                    </div>
                    <div className="text-xs text-muted-foreground">ESP32 Uptime</div>
                  </div>
                  <div>
                    <div className="font-display text-xl font-bold text-foreground sm:text-2xl">
                      Zero
                    </div>
                    <div className="text-xs text-muted-foreground">App Install Req.</div>
                  </div>
                </div>
              </div>

              {/* Hero Right: Interactive Live Facility Radar & Simulator */}
              <div className="scroll-mt-24 lg:col-span-6 xl:col-span-6" id="simulator">
                <div className="relative rounded-2xl border border-border/80 bg-card/90 p-5 shadow-2xl shadow-primary/10 backdrop-blur-xl sm:p-6">
                  {/* Radar Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                        <Radio size={20} className="animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 font-display text-sm font-bold text-foreground">
                          Facility Radar · Level 01
                          <span className="size-2 rounded-full bg-success status-pulse" />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ESP32 Controller Node #A01 · 24ms ping
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${gate === "OPEN"
                            ? "bg-success-soft text-success"
                            : gate === "OPENING"
                              ? "bg-warning-soft text-warning animate-pulse"
                              : "bg-muted text-muted-foreground"
                          }`}
                      >
                        <DoorOpen size={14} />
                        Gate: {gate}
                      </span>
                    </div>
                  </div>

                  {/* Simulator Quick Action Toolbar */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-canvas p-2.5 text-xs">
                    <span className="font-medium text-muted-foreground">
                      Click any bay to toggle state, or trigger gate barrier:
                    </span>
                    <button
                      onClick={triggerGateEntry}
                      disabled={gate !== "CLOSED"}
                      className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1 font-semibold text-primary-foreground shadow-sm transition hover:bg-success disabled:opacity-50"
                    >
                      <Zap size={13} />
                      Simulate Entry
                    </button>
                  </div>

                  {/* Live 8-Bay Facility Grid */}
                  <div className="mt-4 grid grid-cols-4 gap-2.5 sm:gap-3">
                    {slots.map((slot) => {
                      const isSelected = selectedSlotId === slot.id;
                      const isAvail = slot.status === "available";
                      const isOcc = slot.status === "occupied";
                      const isRes = slot.status === "reserved";

                      return (
                        <button
                          key={slot.id}
                          onClick={() => {
                            setSelectedSlotId(slot.id);
                          }}
                          onDoubleClick={() => handleToggleSlotStatus(slot.id)}
                          title={`Click to inspect, double-click to toggle`}
                          className={`group relative flex flex-col items-center justify-between rounded-xl border p-3 text-center transition-all duration-200 ${isSelected ? "ring-2 ring-primary ring-offset-2" : ""
                            } ${isAvail
                              ? "border-success/30 bg-success-soft/60 hover:bg-success-soft"
                              : isOcc
                                ? "border-danger/30 bg-danger-soft/60 hover:bg-danger-soft"
                                : isRes
                                  ? "border-warning/30 bg-warning-soft/60 hover:bg-warning-soft"
                                  : "border-border bg-muted/60"
                            }`}
                        >
                          {/* Bay Header */}
                          <div className="flex w-full items-center justify-between text-[10px] font-bold">
                            <span className="font-display font-bold text-foreground">{slot.id}</span>
                            <span
                              className={`size-2 rounded-full ${isAvail ? "bg-success" : isOcc ? "bg-danger" : "bg-warning"
                                }`}
                            />
                          </div>

                          {/* Vehicle Graphic */}
                          <div className="my-2 flex size-8 items-center justify-center">
                            <CarFront
                              size={22}
                              className={`transition-transform group-hover:scale-110 ${isAvail
                                  ? "text-success/35"
                                  : isOcc
                                    ? "text-danger"
                                    : isRes
                                      ? "text-warning"
                                      : "text-muted-foreground"
                                }`}
                            />
                          </div>

                          {/* Bay Status Label */}
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${isAvail
                                ? "text-success"
                                : isOcc
                                  ? "text-danger"
                                  : isRes
                                    ? "text-warning"
                                    : "text-muted-foreground"
                              }`}
                          >
                            {slot.status}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Selected Bay Quick Inspector */}
                  <div className="mt-4 rounded-xl border border-border/80 bg-background/80 p-3.5 backdrop-blur-md">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-sm font-bold text-foreground">
                          Bay {currentSlot.id}
                        </span>
                        <span
                          className={`rounded px-2 py-0.5 text-[11px] font-bold capitalize ${currentSlot.status === "available"
                              ? "bg-success-soft text-success"
                              : currentSlot.status === "occupied"
                                ? "bg-danger-soft text-danger"
                                : "bg-warning-soft text-warning"
                            }`}
                        >
                          {currentSlot.status}
                        </span>
                        {currentSlot.vehicle && (
                          <span className="font-mono text-xs font-semibold text-muted-foreground">
                            [{currentSlot.vehicle}]
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleSlotStatus(currentSlot.id)}
                          className="rounded-md border border-input bg-card px-2.5 py-1 text-xs font-semibold text-foreground transition hover:bg-secondary"
                        >
                          Toggle Status
                        </button>
                        <Link to="/overview">
                          <span className="text-xs font-semibold text-primary hover:underline">
                            View in Dashboard &rarr;
                          </span>
                        </Link>
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <Activity size={13} className="text-primary" />
                      <span className="truncate">{lastActivityMessage}</span>
                    </div>

                    {currentSession && (
                      <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-border/70 pt-2.5 text-xs">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <ArrowDownLeft size={13} className="text-success" />
                          Arrival
                          <time className="font-mono font-semibold tabular-nums text-foreground">
                            {currentSession.arrival}
                          </time>
                        </span>
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <ArrowUpRight size={13} className="text-info" />
                          Departure
                          {currentSession.departure ? (
                            <time className="font-mono font-semibold tabular-nums text-foreground">
                              {currentSession.departure}
                            </time>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 font-semibold text-success">
                              <span className="size-1.5 rounded-full bg-success status-pulse" />
                              In progress
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Stats Footer */}
                  <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-3 text-center">
                    <div>
                      <div className="text-[11px] text-muted-foreground">Occupancy Rate</div>
                      <div className="font-display text-sm font-bold text-foreground">
                        {occupancyPercentage}%
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-muted-foreground">Available Spots</div>
                      <div className="font-display text-sm font-bold text-success">
                        {availableCount} free
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-muted-foreground">Base Hourly</div>
                      <div className="font-display text-sm font-bold text-foreground">
                        ₹{firstHour}/hr
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* TELEMETRY & HARDWARE STRIP                                         */}
        {/* ------------------------------------------------------------------ */}
        <section className="border-y border-border/80 bg-card/60 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:gap-8">
              <div className="flex items-center gap-3.5">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <div className="font-display text-2xl font-extrabold text-foreground">
                    99.98%
                  </div>
                  <div className="text-xs font-medium text-muted-foreground">
                    Hardware Edge Uptime
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-info-soft text-info">
                  <Gauge size={22} />
                </div>
                <div>
                  <div className="font-display text-2xl font-extrabold text-foreground">
                    &lt; 0.9s
                  </div>
                  <div className="text-xs font-medium text-muted-foreground">
                    Gate Clearance Speed
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-warning-soft text-warning">
                  <TrendingUp size={22} />
                </div>
                <div>
                  <div className="font-display text-2xl font-extrabold text-foreground">
                    +38%
                  </div>
                  <div className="text-xs font-medium text-muted-foreground">
                    Peak Turnover Growth
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-success-soft text-success">
                  <IndianRupee size={22} />
                </div>
                <div>
                  <div className="font-display text-2xl font-extrabold text-foreground">
                    100%
                  </div>
                  <div className="text-xs font-medium text-muted-foreground">
                    Automated Billing Audit
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* IOT HARDWARE ARCHITECTURE (Engineering Credibility)               */}
        {/* ------------------------------------------------------------------ */}
        <section id="architecture" className="relative scroll-mt-20 py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
                <Cpu size={14} />
                Hardware To Cloud Pipeline
              </span>
              <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                Engineered for Low Cost,{" "}
                <span className="text-primary">Zero-Latency Precision.</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                Unlike complex license plate cameras that fail in low light, SmartPark relies on
                rugged ultrasonic &amp; IR sensors powered by edge microcontrollers.
              </p>
            </div>

            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {hardwareSteps.map((step, idx) => (
                <div
                  key={step.number}
                  className="group relative flex flex-col rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display text-4xl font-extrabold text-primary/25 group-hover:text-primary/40">
                      {step.number}
                    </span>
                    <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <step.icon size={20} />
                    </span>
                  </div>

                  <h3 className="mt-6 font-display text-lg font-bold tracking-tight text-foreground">
                    {step.title}
                  </h3>
                  <div className="text-xs font-semibold text-primary">{step.subtitle}</div>

                  <p className="mt-3 flex-1 text-xs leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>

                  <div className="mt-5 border-t border-border pt-3">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-success">
                      <CheckCircle2 size={13} />
                      {step.statusText}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Architecture Banner callout */}
            <div className="mt-10 rounded-2xl border border-border bg-gradient-to-r from-card via-canvas to-card p-6 sm:p-8">
              <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                <div className="max-w-2xl">
                  <h4 className="font-display text-lg font-bold text-foreground">
                    Using Custom ESP32 or Arduino Hardware?
                  </h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    SmartPark comes with fully documented, battle-tested C++ firmware for ESP32
                    boards. Flash your board in minutes with zero proprietary vendor lock-in.
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <Link to="/devices">
                    <Button variant="secondary" size="sm">
                      Inspect Device Feed
                    </Button>
                  </Link>
                  <Link to="/overview">
                    <Button size="sm">
                      View Live Heartbeat <ArrowRight size={14} />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* DUAL EXPERIENCE SHOWCASE (Operator vs Driver)                     */}
        {/* ------------------------------------------------------------------ */}
        <section
          id="showcase"
          className="scroll-mt-20 border-t border-border/80 bg-canvas py-20 lg:py-28"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
                <Layers size={14} />
                Tailored Dual Interface
              </span>
              <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                Complete Command for Operators.{" "}
                <span className="text-primary">Pure Ease for Drivers.</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                Switch between perspectives to see how SmartPark powers operations while eliminating
                driver friction.
              </p>

              {/* Tab Selector Buttons */}
              <div className="mt-8 inline-flex rounded-xl border border-border bg-card p-1.5 shadow-sm">
                <button
                  onClick={() => setShowcaseTab("operator")}
                  className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-xs font-bold transition-all sm:text-sm ${showcaseTab === "operator"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <Gauge size={16} />
                  Facility Operator Console
                </button>
                <button
                  onClick={() => setShowcaseTab("driver")}
                  className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-xs font-bold transition-all sm:text-sm ${showcaseTab === "driver"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <Smartphone size={16} />
                  Mobile Driver App (PWA)
                </button>
              </div>
            </div>

            {/* Showcase Stage */}
            <div className="mt-14">
              {showcaseTab === "operator" ? (
                <div className="grid items-center gap-10 rounded-3xl border border-border/90 bg-card p-6 shadow-xl lg:grid-cols-12 lg:p-10">
                  <div className="lg:col-span-5">
                    <span className="inline-flex items-center gap-2 rounded-md bg-info-soft px-2.5 py-1 text-xs font-bold text-info">
                      For Operations &amp; Property Managers
                    </span>
                    <h3 className="mt-4 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                      Centralized Control Over Every Bay, Gate, and Rupee
                    </h3>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                      No more blind spots. The operator console unifies live telemetry, gate barrier
                      actuation, real-time revenue velocity, and vehicle audit trails.
                    </p>

                    <div className="mt-6 space-y-3.5">
                      {[
                        "Live interactive floor plan with bay occupancy overrides",
                        "Automated entry & exit session auditing with instant fee breakdown",
                        "ESP32 hardware heartbeat and pin diagnostic alerts",
                        "Peak hour yield analysis, dwell duration, and turnover rates",
                      ].map((item) => (
                        <div key={item} className="flex items-start gap-3 text-sm">
                          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-success-soft text-success">
                            <Check size={13} />
                          </span>
                          <span className="text-foreground">{item}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 flex items-center gap-3">
                      <Link to="/overview">
                        <Button className="h-11">
                          Open Operator Console <ArrowRight size={16} />
                        </Button>
                      </Link>
                      <Link to="/analytics">
                        <Button variant="secondary" className="h-11">
                          View Analytics Preview
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Operator Visual Preview Container */}
                  <div className="lg:col-span-7">
                    <div className="rounded-2xl border border-border bg-canvas p-5 shadow-inner">
                      <div className="flex items-center justify-between border-b border-border pb-3 text-xs">
                        <div className="flex items-center gap-2 font-bold">
                          <CircleParking size={16} className="text-primary" />
                          <span>Operator Hub · Main Level</span>
                        </div>
                        <span className="flex items-center gap-1.5 text-success font-semibold">
                          <span className="size-2 rounded-full bg-success status-pulse" />
                          Live Syncing (24ms)
                        </span>
                      </div>

                      {/* Mini Live Stats Cards */}
                      <div className="mt-4 grid grid-cols-3 gap-3">
                        <div className="rounded-xl border border-border bg-card p-3">
                          <div className="text-[11px] text-muted-foreground">Available Bays</div>
                          <div className="font-display text-xl font-bold text-success">
                            {availableCount}
                          </div>
                        </div>
                        <div className="rounded-xl border border-border bg-card p-3">
                          <div className="text-[11px] text-muted-foreground">Occupied Bays</div>
                          <div className="font-display text-xl font-bold text-danger">
                            {occupiedCount}
                          </div>
                        </div>
                        <div className="rounded-xl border border-border bg-card p-3">
                          <div className="text-[11px] text-muted-foreground">Today's Revenue</div>
                          <div className="font-display text-xl font-bold text-foreground">
                            ₹12,450
                          </div>
                        </div>
                      </div>

                      {/* Mini Bay Matrix */}
                      <div className="mt-4 rounded-xl border border-border bg-card p-4">
                        <div className="mb-2 text-xs font-semibold text-muted-foreground">
                          Slot Allocation Matrix (Live)
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {slots.slice(0, 8).map((s) => (
                            <div
                              key={s.id}
                              className={`flex flex-col items-center justify-center rounded-lg border py-2.5 text-xs font-bold ${s.status === "available"
                                  ? "border-success/30 bg-success-soft text-success"
                                  : s.status === "occupied"
                                    ? "border-danger/30 bg-danger-soft text-danger"
                                    : "border-warning/30 bg-warning-soft text-warning"
                                }`}
                            >
                              <span>{s.id}</span>
                              <span className="text-[9px] uppercase">{s.status}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Barrier Gate Servo: Interlocked</span>
                        <Link to="/parking" className="font-bold text-primary hover:underline">
                          Inspect Complete Floor Plan &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid items-center gap-10 rounded-3xl border border-border/90 bg-card p-6 shadow-xl lg:grid-cols-12 lg:p-10">
                  <div className="lg:col-span-5">
                    <span className="inline-flex items-center gap-2 rounded-md bg-accent px-2.5 py-1 text-xs font-bold text-accent-foreground">
                      For Drivers &amp; Commuters
                    </span>
                    <h3 className="mt-4 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                      Zero Circling, Zero Cash Confusion, Zero Frustration
                    </h3>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                      Give drivers the superpower of knowing exactly which bay is open before they
                      turn into your parking garage.
                    </p>

                    <div className="mt-6 space-y-3.5">
                      {[
                        "Real-time visual map shows open, occupied, and reserved bays",
                        "One-tap spot reservation guarantees spot upon arrival",
                        "Transparent upfront pricing calculator with no hidden checkout fees",
                        "Digital ticket timer with saved vehicles and parking history",
                      ].map((item) => (
                        <div key={item} className="flex items-start gap-3 text-sm">
                          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                            <Check size={13} />
                          </span>
                          <span className="text-foreground">{item}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 flex items-center gap-3">
                      <Link to="/driver">
                        <Button className="h-11">
                          Test Driver App Now <ArrowRight size={16} />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Driver Visual Preview Container (Smartphone Frame) */}
                  <div className="flex justify-center lg:col-span-7">
                    <div className="w-full max-w-sm rounded-[32px] border-4 border-foreground/15 bg-card p-4 shadow-2xl">
                      {/* Phone Speaker & Camera Notch */}
                      <div className="mx-auto mb-4 h-4 w-28 rounded-full bg-foreground/10" />

                      {/* Driver App Header */}
                      <div className="flex items-center justify-between border-b border-border pb-3">
                        <div>
                          <div className="font-display text-sm font-bold">SmartPark Driver</div>
                          <div className="text-[11px] text-muted-foreground">Chennai Central Lot</div>
                        </div>
                        <span className="rounded-full bg-success-soft px-2 py-0.5 text-[10px] font-bold text-success">
                          {availableCount} Spots Free
                        </span>
                      </div>

                      {/* Active Spot Booking Card */}
                      <div className="mt-4 rounded-xl border border-primary/30 bg-primary/10 p-3.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-primary">Guaranteed Bay</span>
                          <span className="font-display text-sm font-bold text-foreground">S01</span>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          Rate: ₹{firstHour}/1st hr · ₹{extraHour}/extra hr
                        </div>
                        <Link to="/driver" className="mt-3 block">
                          <Button size="sm" className="w-full">
                            Reserve Bay Now
                          </Button>
                        </Link>
                      </div>

                      {/* Saved Vehicle Preview */}
                      <div className="mt-3.5 rounded-xl border border-border bg-canvas p-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Active Vehicle</span>
                          <span className="font-mono font-bold text-foreground">TN 38 AB 1234</span>
                        </div>
                      </div>

                      {/* Mini Map representation */}
                      <div className="mt-3.5 rounded-xl border border-border p-3 text-center text-xs text-muted-foreground">
                        <div className="flex items-center justify-center gap-1.5 font-semibold text-foreground">
                          <Navigation size={14} className="text-primary" />
                          Turn-by-turn guidance to Bay S01
                        </div>
                        <div className="mt-1 text-[11px]">Level 01 · Right turn from Gate 1</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* INTERACTIVE REVENUE & LEAKAGE ROI CALCULATOR                      */}
        {/* ------------------------------------------------------------------ */}
        <section id="calculator" className="scroll-mt-20 py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
                <IndianRupee size={14} />
                Facility Yield Calculator
              </span>
              <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                How Much Revenue Is Your Lot{" "}
                <span className="text-primary">Leaving on the Table?</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                Manual slip tracking and unmetered turnover leak up to 18% of parking revenues.
                Calculate your projected returns with SmartPark automated telemetry.
              </p>
            </div>

            <div className="mt-16 grid gap-10 rounded-3xl border border-border/80 bg-card p-6 shadow-xl lg:grid-cols-12 lg:p-10">
              {/* Sliders Column */}
              <div className="space-y-8 lg:col-span-6">
                <div>
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-foreground">Total Parking Bays</span>
                    <span className="font-display text-primary">{calcBays} Bays</span>
                  </div>
                  <input
                    type="range"
                    min={8}
                    max={200}
                    step={2}
                    value={calcBays}
                    onChange={(e) => setCalcBays(Number(e.target.value))}
                    className="mt-3 h-2 w-full cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>8 bays (Pilot)</span>
                    <span>100 bays (Mid)</span>
                    <span>200+ bays (Campus)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-foreground">Average Turnover Per Bay (Daily)</span>
                    <span className="font-display text-primary">{calcTurnover} Vehicles/day</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    step={1}
                    value={calcTurnover}
                    onChange={(e) => setCalcTurnover(Number(e.target.value))}
                    className="mt-3 h-2 w-full cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>1 car (Low churn)</span>
                    <span>5 cars (Standard mall)</span>
                    <span>10 cars (Transit hub)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-foreground">Base Hourly Parking Rate</span>
                    <span className="font-display text-primary">₹{calcRate}/hour</span>
                  </div>
                  <input
                    type="range"
                    min={15}
                    max={120}
                    step={5}
                    value={calcRate}
                    onChange={(e) => setCalcRate(Number(e.target.value))}
                    className="mt-3 h-2 w-full cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>₹15/hr</span>
                    <span>₹50/hr</span>
                    <span>₹120/hr</span>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-canvas p-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2 font-semibold text-foreground">
                    <Sparkles size={14} className="text-primary" />
                    Calculation Assumption
                  </div>
                  <div className="mt-1">
                    Based on an average dwell duration of 2.5 hours per session with zero unpaid exits
                    guaranteed by the servo barrier.
                  </div>
                </div>
              </div>

              {/* Computations Result Column */}
              <div className="flex flex-col justify-between rounded-2xl border border-primary/30 bg-primary/5 p-6 sm:p-8 lg:col-span-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    Projected Facility Earnings
                  </span>

                  <div className="mt-4">
                    <div className="text-xs text-muted-foreground">Estimated Monthly Gross Revenue</div>
                    <div className="font-display text-4xl font-extrabold text-foreground sm:text-5xl">
                      ₹{monthlyGross.toLocaleString("en-IN")}
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border/80 pt-6">
                    <div>
                      <div className="text-xs text-muted-foreground">Leakage Recovered</div>
                      <div className="font-display text-xl font-bold text-success sm:text-2xl">
                        +₹{leakagePrevented.toLocaleString("en-IN")}
                      </div>
                      <div className="text-[10px] text-muted-foreground">Monthly leak prevention</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Estimated Payback</div>
                      <div className="font-display text-xl font-bold text-foreground sm:text-2xl">
                        &lt; 35 Days
                      </div>
                      <div className="text-[10px] text-muted-foreground">Hardware + setup ROI</div>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <Link to="/overview">
                    <Button className="h-12 w-full font-bold shadow-lg shadow-primary/20">
                      Configure Your Lot Rates in Settings &rarr;
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* CORE FEATURES GRID (Glassmorphism & Depth)                         */}
        {/* ------------------------------------------------------------------ */}
        <section
          id="features"
          className="scroll-mt-20 border-t border-border/80 bg-canvas py-20 lg:py-28"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
                <CheckCircle2 size={14} />
                Comprehensive Feature Deck
              </span>
              <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                Every Layer of Your Facility,{" "}
                <span className="text-primary">Fully Synchronized.</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                Engineered from the ground up to eliminate attendant bottlenecks, double bookings,
                and lost parking tickets.
              </p>
            </div>

            <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {coreFeatures.map((feat) => (
                <div
                  key={feat.title}
                  className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                        <feat.icon size={22} />
                      </span>
                      <span className="rounded-full border border-border bg-canvas px-2.5 py-0.5 text-[11px] font-bold text-muted-foreground">
                        {feat.badge}
                      </span>
                    </div>

                    <h3 className="mt-6 font-display text-xl font-bold tracking-tight text-foreground">
                      {feat.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {feat.description}
                    </p>
                  </div>

                  <div className="mt-6 border-t border-border pt-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                      {feat.tag}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* TRANSPARENT PRICING PLANS                                          */}
        {/* ------------------------------------------------------------------ */}
        <section id="pricing" className="scroll-mt-20 py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
                <IndianRupee size={14} />
                Straightforward Pricing
              </span>
              <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                Predictable Plans,{" "}
                <span className="text-primary">Infinite Scale.</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                Choose the plan that fits your facility size. All tiers include full access to the
                driver app and real-time WebSocket feeds.
              </p>

              {/* Billing Cycle Toggle */}
              <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-border bg-card p-1.5">
                <button
                  onClick={() => setAnnualBilling(false)}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${!annualBilling
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  Monthly Billing
                </button>
                <button
                  onClick={() => setAnnualBilling(true)}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition ${annualBilling
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  Annual Billing
                  <span className="rounded-full bg-success-soft px-1.5 py-0.2 text-[10px] text-success">
                    Save 20%
                  </span>
                </button>
              </div>
            </div>

            <div className="mx-auto mt-14 grid max-w-6xl gap-8 lg:grid-cols-3">
              {/* Starter Tier */}
              <div className="flex flex-col rounded-3xl border border-border/80 bg-card p-8 shadow-sm">
                <h3 className="font-display text-xl font-bold text-foreground">Starter</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  For single-floor basements &amp; standalone lots.
                </p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-extrabold text-foreground">
                    {annualBilling ? "₹960" : "₹1,200"}
                  </span>
                  <span className="text-xs text-muted-foreground">/ bay / month</span>
                </div>

                <ul className="mt-8 flex-1 space-y-3.5 text-xs text-foreground">
                  {[
                    "Live 2D floor occupancy map",
                    "Driver mobile reservations (PWA)",
                    "Live session tracking & timestamps",
                    "Community & email support",
                  ].map((feat) => (
                    <li key={feat} className="flex items-center gap-2.5">
                      <Check size={14} className="text-success" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/overview" className="mt-8 block">
                  <Button variant="secondary" className="h-11 w-full font-semibold">
                    Launch Starter Preview
                  </Button>
                </Link>
              </div>

              {/* Facility Tier (Featured) */}
              <div className="relative flex flex-col rounded-3xl border-2 border-primary bg-card p-8 shadow-2xl shadow-primary/10">
                <span className="absolute -top-3.5 left-8 rounded-full bg-primary px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-widest text-primary-foreground">
                  Most Popular · Best Value
                </span>

                <h3 className="font-display text-xl font-bold text-foreground">Facility</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  For multi-level commercial garages &amp; malls.
                </p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-extrabold text-foreground">
                    {annualBilling ? "₹1,920" : "₹2,400"}
                  </span>
                  <span className="text-xs text-muted-foreground">/ bay / month</span>
                </div>

                <ul className="mt-8 flex-1 space-y-3.5 text-xs text-foreground">
                  {[
                    "Everything in Starter plan",
                    "Automated servo gate barrier interlock",
                    "ESP32 hardware heartbeat & pin diagnostics",
                    "Revenue & peak occupancy analytics suite",
                    "Overstay violation & alert triggers",
                    "Priority 24/7 technical assistance",
                  ].map((feat) => (
                    <li key={feat} className="flex items-center gap-2.5">
                      <Check size={14} className="text-primary" />
                      <span className="font-medium">{feat}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/overview" className="mt-8 block">
                  <Button className="h-11 w-full font-bold shadow-md shadow-primary/25">
                    Launch Facility Deck <ArrowRight size={16} />
                  </Button>
                </Link>
              </div>

              {/* Enterprise Tier */}
              <div className="flex flex-col rounded-3xl border border-border/80 bg-card p-8 shadow-sm">
                <h3 className="font-display text-xl font-bold text-foreground">Enterprise</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  For airport authorities &amp; multi-city portfolios.
                </p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-extrabold text-foreground">
                    Custom
                  </span>
                  <span className="text-xs text-muted-foreground">multi-campus SLA</span>
                </div>

                <ul className="mt-8 flex-1 space-y-3.5 text-xs text-foreground">
                  {[
                    "Everything in Facility tier",
                    "Multi-facility fleet overview dashboard",
                    "Custom REST & Webhook APIs for ERP sync",
                    "FASTag & RFID barrier integrations",
                    "Dedicated solutions engineer",
                  ].map((feat) => (
                    <li key={feat} className="flex items-center gap-2.5">
                      <Check size={14} className="text-success" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/overview" className="mt-8 block">
                  <Button variant="secondary" className="h-11 w-full font-semibold">
                    Contact Solutions Team
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* VERIFIED CUSTOMER REVIEWS & SOCIAL PROOF                           */}
        {/* ------------------------------------------------------------------ */}
        <section className="border-t border-border/80 bg-canvas py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
                <Star size={14} className="fill-primary" />
                Verified Deployments
              </span>
              <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                Loved by Property Leaders Across India.
              </h2>
            </div>

            <div className="mt-16 grid gap-6 md:grid-cols-3">
              {testimonials.map((t) => (
                <div
                  key={t.name}
                  className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-7 shadow-sm transition hover:border-primary/30"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1 text-amber-500">
                        {Array.from({ length: t.rating }).map((_, i) => (
                          <Star key={i} size={15} className="fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="rounded bg-success-soft px-2 py-0.5 text-[10px] font-bold text-success">
                        {t.stats}
                      </span>
                    </div>

                    <blockquote className="mt-5 text-sm leading-relaxed text-foreground">
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
                  </div>

                  <div className="mt-6 border-t border-border pt-4">
                    <div className="font-display text-sm font-bold text-foreground">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                    <div className="text-[11px] font-medium text-primary">{t.facility}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* INTERACTIVE FAQ ACCORDION                                          */}
        {/* ------------------------------------------------------------------ */}
        <section className="border-t border-border/80 py-20 lg:py-28">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
                <HelpCircle size={14} />
                Frequently Asked Questions
              </span>
              <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                Everything You Need to Know
              </h2>
            </div>

            <div className="mt-12 space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = expandedFaq === idx;
                return (
                  <div
                    key={faq.q}
                    className="overflow-hidden rounded-2xl border border-border/80 bg-card transition"
                  >
                    <button
                      onClick={() => setExpandedFaq(isOpen ? null : idx)}
                      className="flex w-full items-center justify-between p-5 text-left text-sm font-bold text-foreground transition hover:text-primary sm:text-base"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        size={18}
                        className={`shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-primary" : "text-muted-foreground"
                          }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="border-t border-border/60 bg-canvas/60 px-5 py-4 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* HIGH-CONVERTING CLOSING BANNER                                     */}
        {/* ------------------------------------------------------------------ */}
        <section className="border-t border-border/80 bg-canvas py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-8 text-white shadow-2xl sm:p-14 lg:p-20">
              {/* Decorative Background Rings */}
              <CircleParking
                size={480}
                strokeWidth={0.3}
                aria-hidden
                className="pointer-events-none absolute -right-20 -top-24 text-emerald-400/10"
              />

              <div className="relative max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-400">
                  <Sparkles size={13} />
                  Immediate Interactive Access
                </div>

                <h2 className="mt-6 font-display text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl lg:leading-tight">
                  Stop Guessing Occupancy.{" "}
                  <span className="text-emerald-400">Start Automating.</span>
                </h2>

                <p className="mt-5 text-base leading-relaxed text-slate-300 sm:text-lg">
                  Both the Operator Dashboard and the Driver PWA are active and live in this demo
                  preview. Test slot status transitions, barrier gate actuation, and revenue metrics
                  instantly.
                </p>

                <div className="mt-9 flex flex-wrap items-center gap-4">
                  <Link to="/overview">
                    <Button className="h-12 bg-emerald-500 px-7 text-sm font-bold text-slate-950 hover:bg-emerald-400">
                      Open Operator Dashboard <ArrowRight size={17} />
                    </Button>
                  </Link>

                  <Link to="/driver">
                    <Button
                      variant="ghost"
                      className="h-12 border border-white/20 px-6 text-sm font-bold text-white hover:bg-white/10"
                    >
                      <Smartphone size={16} />
                      Open Driver App
                    </Button>
                  </Link>
                </div>

                <div className="mt-8 flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    No credit card required
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    Live prototype state
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* NEWSLETTER SECTION                                                 */}
        {/* ------------------------------------------------------------------ */}
        <section className="border-t border-border/80 bg-card py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-6 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <h3 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  Stay Updated on Smart Parking Innovations
                </h3>
                <p className="mt-1.5 text-xs text-muted-foreground sm:text-sm">
                  Receive engineering notes on ESP32 firmware upgrades, sensor benchmarks, and
                  yield management strategies. No spam, ever.
                </p>
              </div>

              <div className="lg:col-span-5">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!email.trim()) return;
                    setSubscribed(true);
                    setEmail("");
                  }}
                  className="flex gap-2"
                >
                  <label htmlFor="landing-email" className="sr-only">
                    Work Email
                  </label>
                  <input
                    id="landing-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="facility.manager@company.com"
                    className="surface-input h-11 flex-1 px-4 text-sm"
                  />
                  <Button type="submit" className="h-11 shrink-0 font-semibold">
                    {subscribed ? "Subscribed" : "Subscribe"}
                  </Button>
                </form>
                {subscribed && (
                  <p role="status" className="mt-2 text-xs font-semibold text-success">
                    Thanks for joining! You are on our technical update list.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* -------------------------------------------------------------------- */}
      {/* SITE FOOTER                                                          */}
      {/* -------------------------------------------------------------------- */}
      <footer className="border-t border-border/80 bg-canvas py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <Link to="/" aria-label="SmartPark Home">
                <Wordmark />
              </Link>
              <p className="mt-4 max-w-sm text-xs leading-relaxed text-muted-foreground">
                Autonomous smart parking infrastructure connecting microcontrollers, ultrasonic
                sensors, servo barrier gates, and mobile driver booking.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin size={14} className="text-primary" />
                <span>Chennai &amp; Bengaluru, India</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Live Platforms
              </h4>
              <ul className="mt-3.5 space-y-2 text-xs text-muted-foreground">
                <li>
                  <Link to="/overview" className="transition hover:text-foreground">
                    Operator Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/driver" className="transition hover:text-foreground">
                    Driver Web-App (PWA)
                  </Link>
                </li>
                <li>
                  <Link to="/parking" className="transition hover:text-foreground">
                    2D Live Parking Map
                  </Link>
                </li>
                <li>
                  <Link to="/analytics" className="transition hover:text-foreground">
                    Revenue &amp; Dwell Analytics
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Hardware &amp; System
              </h4>
              <ul className="mt-3.5 space-y-2 text-xs text-muted-foreground">
                <li>
                  <Link to="/devices" className="transition hover:text-foreground">
                    ESP32 Device Fleet
                  </Link>
                </li>
                <li>
                  <Link to="/sessions" className="transition hover:text-foreground">
                    Session Audit Log
                  </Link>
                </li>
                <li>
                  <Link to="/vehicles" className="transition hover:text-foreground">
                    Vehicle Directory
                  </Link>
                </li>
                <li>
                  <Link to="/settings" className="transition hover:text-foreground">
                    Tariff Rates &amp; Config
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Contact &amp; Operations
              </h4>
              <ul className="mt-3.5 space-y-2 text-xs text-muted-foreground">
                <li>contact@smartpark.iot</li>
                <li>+91 (044) 4920-8000</li>
                <li className="pt-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-0.5 text-[10px] font-bold text-success">
                    <span className="size-1.5 rounded-full bg-success status-pulse" />
                    All Edge Nodes Operational
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-xs text-muted-foreground sm:flex-row">
            <div>
              &copy; {new Date().getFullYear()} SmartPark Technologies. Open IoT Architecture.
            </div>
            <div className="flex gap-4">
              <a href="#simulator" className="transition hover:text-foreground">
                Simulator
              </a>
              <a href="#pricing" className="transition hover:text-foreground">
                Pricing
              </a>
              <a href="#architecture" className="transition hover:text-foreground">
                Architecture
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}