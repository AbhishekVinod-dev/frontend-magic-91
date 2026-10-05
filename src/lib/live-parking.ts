import { SENSOR_SLOT_IDS, type LiveStatus } from "./supabase-schema";
import type { Slot } from "./parking-context";

/**
 * Overlay live controller readings onto the demo floor.
 *
 * The ESP32 is wired for two bays while the demo floor models eight, so the
 * controller can only speak for its own bays. Its `available_slots` count is
 * therefore also scoped to those bays — mixing it with the eight-bay demo total
 * would produce a number that matches neither. Bays the controller does not
 * report keep their demo status so the rest of the UI stays coherent.
 */
export function mergeLiveSlots(slots: Slot[], live: LiveStatus | null | undefined): Slot[] {
  if (!live) return slots;

  const sensorStatus = (occupied: boolean): Slot["status"] => (occupied ? "occupied" : "available");

  return slots.map((slot) => {
    if (slot.id === SENSOR_SLOT_IDS.slot1) {
      return { ...slot, status: sensorStatus(live.slot1Occupied), vehicle: undefined };
    }
    if (slot.id === SENSOR_SLOT_IDS.slot2) {
      return { ...slot, status: sensorStatus(live.slot2Occupied), vehicle: undefined };
    }
    return slot;
  });
}

/** Bays the controller actually reports, for labelling the live badge honestly. */
export function liveSlotIds(live: LiveStatus | null | undefined): string[] {
  if (!live) return [];
  return [SENSOR_SLOT_IDS.slot1, SENSOR_SLOT_IDS.slot2];
}

/** Availability across the controller's own bays, from `available_slots`. */
export function liveAvailability(live: LiveStatus | null | undefined): {
  available: number;
  total: number;
} {
  if (!live) return { available: 0, total: 0 };
  const total = live.totalSlots ?? 2;
  return { available: live.availableSlots ?? 0, total };
}

/** Whole seconds since the newest reading, or `null` when we have no reading. */
export function readingAgeSeconds(
  live: LiveStatus | null | undefined,
  now = Date.now(),
): number | null {
  if (!live?.lastReadingAt) return null;
  const at = Date.parse(live.lastReadingAt);
  if (Number.isNaN(at)) return null;
  return Math.max(0, Math.round((now - at) / 1000));
}

/**
 * The firmware writes every ~5s, so anything much older means the feed is stale
 * rather than merely idle.
 */
export function isReadingStale(live: LiveStatus | null | undefined, now = Date.now()): boolean {
  const age = readingAgeSeconds(live, now);
  return age !== null && age > 30;
}
