/**
 * Parking sessions record when a vehicle arrives at and leaves a bay.
 *
 * Times are wall-clock strings in `HH:MM:SS` (24-hour), matching the activity
 * log elsewhere in the app. A session's `arrival` may be `"—"` when the start
 * was not observed — for example a bay that was already occupied the first time
 * the app read the floor — so the formatting helpers tolerate a missing value
 * rather than guessing.
 */
export type ParkingSession = {
  id: number;
  slot: string;
  plate: string;
  /** `HH:MM:SS` when the vehicle arrived, or `"—"` when it was not observed. */
  arrival: string;
  /** `HH:MM:SS` when the vehicle left, or `null` while it is still parked. */
  departure: string | null;
  status: "Active" | "Completed";
};

/** Local wall-clock time as `HH:MM:SS`, e.g. "10:32:14". */
export function clockTime(date: Date = new Date()): string {
  return date.toLocaleTimeString("en-IN", { hour12: false });
}

const TIME_PATTERN = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;

/** Parse `HH:MM` / `HH:MM:SS` into seconds since midnight, else `null`. */
export function clockSeconds(value: string | null | undefined): number | null {
  if (!value) return null;
  const match = TIME_PATTERN.exec(value.trim());
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = match[3] ? Number(match[3]) : 0;
  if (hours > 23 || minutes > 59 || seconds > 59) return null;

  return hours * 3600 + minutes * 60 + seconds;
}

/** Whole minutes since midnight for a `Date`, used for live (active) sessions. */
function secondsOfDay(date: Date): number {
  return date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
}

/**
 * Minutes a stay has lasted. Completed sessions measure arrival → departure;
 * active sessions measure arrival → now.
 */
export function sessionMinutes(session: ParkingSession, now: Date = new Date()): number | null {
  const start = clockSeconds(session.arrival);
  if (start === null) return null;

  const end = session.departure !== null ? clockSeconds(session.departure) : secondsOfDay(now);
  if (end === null) return null;

  // A stay that crosses midnight leaves a negative difference; wrap it.
  let seconds = end - start;
  if (seconds < 0) seconds += 24 * 3600;
  return Math.max(0, Math.round(seconds / 60));
}

/** Human duration such as "48m" or "1h 24m". */
export function formatDuration(minutes: number | null): string {
  if (minutes === null) return "—";
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest}m`;
  if (rest === 0) return `${hours}h`;
  return `${hours}h ${rest}m`;
}

/**
 * Fee for a stay, using the same first-hour / extra-hour / daily-cap model as
 * the driver view. Returns `null` when the duration is unknown.
 */
export function sessionFee(
  session: ParkingSession,
  rates: { firstHour: number; extraHour: number; dailyMax: number },
  now: Date = new Date(),
): number | null {
  const minutes = sessionMinutes(session, now);
  if (minutes === null) return null;
  const hours = Math.max(1, Math.ceil(minutes / 60));
  return Math.min(rates.dailyMax, rates.firstHour + Math.max(0, hours - 1) * rates.extraHour);
}

/**
 * Newest session for a bay. Sessions are stored newest-first, so the first
 * match is the one currently relevant (active, or the most recent departure).
 */
export function latestSession(
  sessions: ParkingSession[],
  slot: string,
): ParkingSession | undefined {
  return sessions.find((session) => session.slot === slot);
}
