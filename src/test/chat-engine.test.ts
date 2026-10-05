import { describe, expect, it } from "vitest";

import {
  estimateFee,
  parseHours,
  parseSlotId,
  respond,
  startingPrompts,
  type ChatSnapshot,
} from "@/lib/chat-engine";

const snapshot: ChatSnapshot = {
  scope: "operator",
  slots: [
    { id: "S01", status: "available" },
    { id: "S02", status: "occupied", vehicle: "TN 38 AB 1234" },
    { id: "S03", status: "available" },
    { id: "S04", status: "occupied", vehicle: "TN 01 XY 5678" },
    { id: "S05", status: "available" },
    { id: "S06", status: "reserved" },
    { id: "S07", status: "available" },
    { id: "S08", status: "maintenance" },
  ],
  vehicles: [
    { plate: "TN 38 AB 1234", type: "Car", model: "Hyundai i20", color: "Silver" },
    { plate: "TN 01 XY 5678", type: "Bike", model: "Honda Activa", color: "Black" },
  ],
  events: [
    {
      id: 1,
      kind: "Vehicle entered",
      detail: "TN 38 AB 1234 · Gate opened",
      time: "10:32:14",
      tone: "success",
    },
    {
      id: 2,
      kind: "Slot occupied",
      detail: "S02 · TN 38 AB 1234",
      time: "10:30:42",
      tone: "danger",
    },
  ],
  firstHour: 20,
  extraHour: 10,
  dailyMax: 100,
};

const ask = (question: string, overrides: Partial<ChatSnapshot> = {}) =>
  respond(question, { ...snapshot, ...overrides });

describe("chat engine parsing", () => {
  it("reads bay ids in the shapes visitors type them", () => {
    expect(parseSlotId("is S03 free?")).toBe("S03");
    expect(parseSlotId("what about slot 3")).toBe("S03");
    expect(parseSlotId("Bay 12 please")).toBe("S12");
    expect(parseSlotId("3 hours please")).toBeUndefined();
  });

  it("reads stay durations and falls back to two hours", () => {
    expect(parseHours("what will 3 hours cost")).toBe(3);
    expect(parseHours("i need 45 minutes")).toBe(1);
    expect(parseHours("parking for a full day")).toBe(24);
    expect(parseHours("hello there")).toBe(2);
  });

  it("caps the fee at the daily maximum", () => {
    const rates = { firstHour: 20, extraHour: 10, dailyMax: 100 };
    expect(estimateFee(rates, 1)).toBe(20);
    expect(estimateFee(rates, 3)).toBe(40);
    expect(estimateFee(rates, 24)).toBe(100);
  });
});

describe("chat engine answers", () => {
  it("reports live availability from the shared slot state", () => {
    const reply = ask("how many spaces are free?");

    expect(reply.intent).toBe("availability");
    expect(reply.text).toContain("4 of 8 bays are free right now");
    expect(reply.text).toContain("S01");
  });

  it("prices a stay from the requested duration", () => {
    expect(ask("what will 3 hours cost?").text).toContain("₹40");
    expect(ask("how much for a full day?").text).toContain("₹100");
  });

  it("answers for a specific bay and offers free alternatives", () => {
    const taken = ask("is S02 free?");
    expect(taken.intent).toBe("slot-status");
    expect(taken.text).toContain("TN 38 AB 1234");
    expect(taken.text).toContain("Free right now");

    const free = ask("what is the status of S03");
    expect(free.text).toContain("Bay S03 is available.");
  });

  it("holds a bay for confirmation instead of reserving straight away", () => {
    const offer = ask("reserve S05");

    expect(offer.intent).toBe("reserve");
    expect(offer.pending).toBe("S05");
    expect(offer.commit).toBeUndefined();

    const confirm = ask("confirm", { pendingSlot: "S05" });
    expect(confirm.commit).toBe("S05");
    expect(confirm.pending).toBeNull();
    expect(confirm.text).toContain("TN 38 AB 1234");
  });

  it("releases a held bay when the visitor cancels", () => {
    const reply = ask("cancel", { pendingSlot: "S05" });

    expect(reply.intent).toBe("cancel-reservation");
    expect(reply.pending).toBeNull();
  });

  it("refuses to reserve a bay that is not free", () => {
    const reply = ask("book bay 2");

    expect(reply.intent).toBe("reserve");
    expect(reply.pending).toBeUndefined();
    expect(reply.text).toContain("occupied by TN 38 AB 1234");
  });

  it("lists maintenance bays and device health", () => {
    expect(ask("is any bay under maintenance?").text).toContain("S08");
    expect(ask("how are the sensors?").text).toContain("10 of 10 sensors reporting");
  });

  it("reads occupancy and recent activity from live state", () => {
    expect(ask("how full is the floor?").text).toContain("25%");

    const activity = ask("show recent activity");
    expect(activity.text).toContain("Vehicle entered");
    expect(activity.actions?.[0]).toMatchObject({ kind: "navigate", to: "/sessions" });
  });

  it("offers page shortcuts and quick replies", () => {
    const nav = ask("open the parking map");
    expect(nav.intent).toBe("navigate");
    expect(nav.actions?.[0]).toMatchObject({ kind: "navigate", to: "/parking" });

    const unknown = ask("do you sell umbrellas?");
    expect(unknown.intent).toBe("fallback");
    expect(unknown.actions?.length).toBeGreaterThan(0);
  });

  it("tailors starter prompts to where the visitor is", () => {
    expect(startingPrompts("driver")[0]).toContain("free");
    expect(startingPrompts("landing").join(" ")).toContain("pricing");
  });
});
