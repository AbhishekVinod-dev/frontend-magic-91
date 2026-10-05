import { useEffect, useState } from "react";
import { useQuery, useQueryClient, type UseQueryResult } from "@tanstack/react-query";
import { isSupabaseConfigured, supabase } from "./supabase";
import { TABLES, toLiveStatus, type DeviceReading, type LiveStatus } from "./supabase-schema";

const liveQueryKey = ["supabase", TABLES.readings, "latest"] as const;

/**
 * Columns fetched for the live view. Kept explicit so `select *` can't leak extra
 * columns, and kept in sync with the verified `parking_status` schema.
 */
const LIVE_COLUMNS =
  "id, device_id, available_slots, total_slots, slot1_occupied, slot2_occupied, entrance_detected, exit_detected, gate_status, created_at";

/**
 * The firmware appends a row every ~5s. Poll on that cadence as a safety net for
 * when the realtime socket is blocked, while realtime invalidation remains the
 * fast path.
 */
const POLL_INTERVAL_MS = 5_000;

/**
 * Current facility state, taken from the newest row in the readings table.
 *
 * Rows are append-only, so this is a "latest wins" read ordered by
 * `created_at` desc. Subscribes to Postgres changes so the dashboard updates
 * the moment the ESP32 writes a reading. Returns `null` data when Supabase
 * isn't configured, which lets callers keep their local demo state.
 */
export function useLiveStatus(): UseQueryResult<LiveStatus | null> {
  const queryClient = useQueryClient();

  const query = useQuery<LiveStatus | null>({
    queryKey: liveQueryKey,
    enabled: isSupabaseConfigured,
    // Readings only ever get newer, so a stale window just means the next
    // refresh corrects it rather than showing a wrong number as fresh.
    refetchInterval: POLL_INTERVAL_MS,
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const { data, error } = await supabase!
        .from(TABLES.readings)
        .select(LIVE_COLUMNS)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return toLiveStatus(data as DeviceReading | null);
    },
  });

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const channel = supabase!
      .channel("readings-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: TABLES.readings }, () => {
        void queryClient.invalidateQueries({ queryKey: liveQueryKey });
      })
      .subscribe();

    return () => {
      void supabase!.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

/**
 * True once a real-time subscription is actually pushing updates.
 *
 * Use this to drive the "Live" indicators instead of showing an unconditional
 * green pulse, which currently implies a connection that may not exist.
 */
export function useRealtimeConnected(): boolean {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const channel = supabase!
      .channel("connection-probe")
      .subscribe((status) => setConnected(status === "SUBSCRIBED"));

    return () => {
      void supabase!.removeChannel(channel);
    };
  }, []);

  return connected;
}
