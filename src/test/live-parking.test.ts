import { describe, expect, it } from "vitest";

import {
  isReadingStale,
  liveAvailability,
  liveSlotIds,
  mergeLiveSlots,
  readingAgeSeconds,
} from "@/lib/live-parking";
import { toLiveStatus, type DeviceReading, type LiveStatus } from "@/lib/supabase-schema";
import type { Slot } from "@/lib/parking-context";

const demoSlots: Slot[] = [
  { id: "S01", status: "available" },
  { id: "S02", status: "occupied", vehicle: "TN 38 AB 1234" },
  { id: "S03", status: "reserved" },
];

function live(overrides: Partial<LiveStatus> = {}): LiveStatus {
  return {
    availableSlots: 2,
    totalSlots: 2,
    deviceId: "ESP32-PARK-001",
    slot1Occupied: false,
    slot2Occupied: false,
    entranceDetected: false,
    exitDetected: false,
    gateOpen: false,
    lastReadingAt: "2026-10-05T07:50:07.815913+00:00",
    ...overrides,
  };
}

describe("toLiveStatus", () => {
  it("maps the parking_status columns onto the UI shape", () => {
    const reading: DeviceReading = {
      available_slots: 1,
      total_slots: 2,
      slot1_occupied: false,
      slot2_occupied: true,
      entrance_detected: true,
      exit_detected: false,
      gate_status: "open",
      created_at: "2026-10-05T07:50:07.815913+00:00",
    };

    expect(toLiveStatus(reading)).toEqual({
      availableSlots: 1,
      totalSlots: 2,
      deviceId: null,
      slot1Occupied: false,
      slot2Occupied: true,
      entranceDetected: true,
      exitDetected: false,
      gateOpen: true,
      lastReadingAt: "2026-10-05T07:50:07.815913+00:00",
    });
  });

  it("reads 1 as active and 0 as inactive for raw pin-state builds", () => {
    const status = toLiveStatus({
      available_slots: 0,
      slot1_occupied: 1,
      slot2_occupied: 0,
      entrance_detected: 1,
      exit_detected: 0,
      gate_status: "closed",
      created_at: "2026-10-05T07:50:07.815913+00:00",
    });

    expect(status?.slot1Occupied).toBe(true);
    expect(status?.slot2Occupied).toBe(false);
    expect(status?.entranceDetected).toBe(true);
    expect(status?.gateOpen).toBe(false);
  });

  it("treats a null pin reading as inactive rather than guessing", () => {
    const status = toLiveStatus({
      available_slots: null,
      slot1_occupied: null,
      slot2_occupied: null,
      entrance_detected: null,
      exit_detected: null,
      gate_status: null,
      created_at: "2026-10-05T07:50:07.815913+00:00",
    });

    expect(status?.slot1Occupied).toBe(false);
    expect(status?.gateOpen).toBe(false);
    expect(status?.availableSlots).toBeNull();
  });

  it("returns null for no row so callers keep their demo state", () => {
    expect(toLiveStatus(null)).toBeNull();
  });
});

describe("mergeLiveSlots", () => {
  it("overlays only the bays the controller is wired for", () => {
    const merged = mergeLiveSlots(demoSlots, live({ slot1Occupied: true, slot2Occupied: true }));

    expect(merged.find((s) => s.id === "S01")?.status).toBe("occupied");
    expect(merged.find((s) => s.id === "S02")?.status).toBe("occupied");
    // S03 has no sensor, so it keeps the demo status rather than being invented.
    expect(merged.find((s) => s.id === "S03")?.status).toBe("reserved");
  });

  it("clears the demo plate when a sensor reports a bay free", () => {
    const merged = mergeLiveSlots(demoSlots, live({ slot2Occupied: false }));
    const s02 = merged.find((s) => s.id === "S02");

    expect(s02?.status).toBe("available");
    expect(s02?.vehicle).toBeUndefined();
  });

  it("leaves the floor untouched when there is no reading", () => {
    expect(mergeLiveSlots(demoSlots, null)).toBe(demoSlots);
  });
});

describe("live feed helpers", () => {
  it("scopes availability to the controller's own bay count", () => {
    expect(liveAvailability(live({ availableSlots: 2, totalSlots: 2 }))).toEqual({
      available: 2,
      total: 2,
    });
  });

  it("falls back to two bays when the device omits total_slots", () => {
    expect(liveAvailability(live({ availableSlots: 1, totalSlots: null }))).toEqual({
      available: 1,
      total: 2,
    });
  });

  it("reports zeroed availability with no reading rather than a fake count", () => {
    expect(liveAvailability(null)).toEqual({ available: 0, total: 0 });
    expect(liveSlotIds(null)).toEqual([]);
  });

  it("measures reading age and flags a feed that stopped writing", () => {
    const at = Date.parse("2026-10-05T07:50:07.815913+00:00");
    const reading = live();

    expect(readingAgeSeconds(reading, at + 5_400)).toBe(5);
    expect(isReadingStale(reading, at + 5_400)).toBe(false);
    // Firmware writes every ~5s, so past 30s means the feed stopped.
    expect(isReadingStale(reading, at + 60_000)).toBe(true);
  });

  it("clamps a clock skew that makes a reading look like it is from the future", () => {
    const at = Date.parse("2026-10-05T07:50:07.815913+00:00");

    expect(readingAgeSeconds(live(), at - 30_000)).toBe(0);
  });

  it("has no age to report when no reading has arrived", () => {
    expect(readingAgeSeconds(live({ lastReadingAt: null }))).toBeNull();
    expect(readingAgeSeconds(null)).toBeNull();
  });
});
