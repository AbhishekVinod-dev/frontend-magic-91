import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Tests run on demo parking state. Without this, `ParkingProvider` would issue
// real Supabase requests and poll every 5s, making the suite slow and flaky.
vi.stubEnv("VITE_FORCE_DEMO", "1");

Object.defineProperty(window, "scrollTo", {
  writable: true,
  value: () => {},
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
