/**
 * Supabase schema mapping — verified against the live `parking_status` table:
 *
 *   id                bigint     serial primary key
 *   device_id         text       e.g. 'ESP32-PARK-001'
 *   available_slots   integer    totalSlots - occupiedSlots, from checkParkingSlots()
 *   total_slots       integer    bays the controller is wired for (currently 2)
 *   slot1_occupied    boolean    SLOT1_IR (GPIO 26), LOW = vehicle present
 *   slot2_occupied    boolean    SLOT2_IR (GPIO 27), LOW = vehicle present
 *   entrance_detected boolean    ENTRANCE_IR (GPIO 18), LOW = vehicle present
 *   exit_detected     boolean    EXIT_IR (GPIO 19), LOW = vehicle present
 *   gate_status       text       servo position, e.g. 'open' | 'closed'
 *   created_at        timestamptz row timestamp, written by the ESP32
 *
 * The firmware appends a row roughly every 5 seconds, so the newest row by
 * `created_at` is the current facility state.
 */
export const TABLES = {
  /** The single table the ESP32 writes its sensor readings to. */
  readings: "parking_status",
} as const;

/**
 * One sensor reading. Rows are append-only history, so the newest row by
 * `created_at` is the current facility state.
 *
 * The `_occupied` / `_detected` columns are typed `boolean | number` because
 * some firmware builds report IR pins as raw `LOW`/`HIGH` integers. The live
 * table returns `boolean`, but this union means we accept either encoding
 * without guessing wrong.
 */
export type DeviceReading = {
  id?: number | null;
  device_id?: string | null;
  available_slots: number | null;
  total_slots?: number | null;
  slot1_occupied: boolean | number | null;
  slot2_occupied: boolean | number | null;
  entrance_detected: boolean | number | null;
  exit_detected: boolean | number | null;
  gate_status: string | null;
  created_at: string;
};

/** Derived, UI-shaped view of the newest reading. */
export type LiveStatus = {
  availableSlots: number | null;
  /** Bays the controller is actually wired for. `null` when not reported. */
  totalSlots: number | null;
  deviceId: string | null;
  slot1Occupied: boolean;
  slot2Occupied: boolean;
  entranceDetected: boolean;
  exitDetected: boolean;
  gateOpen: boolean;
  lastReadingAt: string | null;
};

/** Gate values the firmware can report. Treat anything else as closed. */
const OPEN_GATE_VALUES = new Set(["open", "opened", "1", "true"]);

/**
 * The live table stores these as `boolean`, so `true` is the only active value.
 *
 * The `number` arm exists for firmware builds that push raw pin states instead.
 * Those report `1` for an active sensor, matching what the table holds today.
 */
function isActive(value: boolean | number | null | undefined): boolean {
  return value === true || value === 1;
}

/** Collapse a raw reading row into the shape the components consume. */
export function toLiveStatus(reading: DeviceReading | null | undefined): LiveStatus | null {
  if (!reading) return null;

  return {
    availableSlots: reading.available_slots ?? null,
    totalSlots: reading.total_slots ?? null,
    deviceId: reading.device_id ?? null,
    slot1Occupied: isActive(reading.slot1_occupied),
    slot2Occupied: isActive(reading.slot2_occupied),
    entranceDetected: isActive(reading.entrance_detected),
    exitDetected: isActive(reading.exit_detected),
    gateOpen:
      reading.gate_status != null && OPEN_GATE_VALUES.has(reading.gate_status.toLowerCase()),
    lastReadingAt: reading.created_at ?? null,
  };
}

/** The `Slot` ids the two physical IR sensors map onto. */
export const SENSOR_SLOT_IDS = { slot1: "S01", slot2: "S02" } as const;
