import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ChatWidget } from "@/components/ChatWidget";
import { ChatProvider, useChat } from "@/lib/chat-context";
import { ParkingProvider } from "@/lib/parking-context";

/**
 * A throwaway router so the assistant can be exercised at a chosen path without
 * pulling in the full app shell, its stylesheets or any route loader.
 */
/**
 * A throwaway router so the assistant can be exercised at a chosen path without
 * pulling in the full app shell, its stylesheets or any route loader.
 */
async function renderChat(path: string) {
  const Probe = () => {
    const { pendingSlot } = useChat();
    return <span data-testid="pending">{pendingSlot ?? "none"}</span>;
  };

  const queryClient = new QueryClient();
  const rootRoute = createRootRoute({
    component: () => (
      <QueryClientProvider client={queryClient}>
        <ParkingProvider>
          <ChatProvider>
            <ChatWidget />
            <Probe />
          </ChatProvider>
        </ParkingProvider>
      </QueryClientProvider>
    ),
  });
  const routes = ["/", "overview", "driver"].map((routePath) =>
    createRoute({ getParentRoute: () => rootRoute, path: routePath, component: () => null }),
  );
  const router = createRouter({
    routeTree: rootRoute.addChildren(routes),
    context: { queryClient },
    history: createMemoryHistory({ initialEntries: [path] }),
  });

  await router.load();
  render(<RouterProvider router={router} />);
}

async function openPanel() {
  fireEvent.click(await screen.findByRole("button", { name: "Open SmartPark assistant" }));
  return screen.getByRole("dialog", { name: "SmartPark assistant" });
}

function ask(question: string) {
  fireEvent.change(screen.getByLabelText("Message the SmartPark assistant"), {
    target: { value: question },
  });
  fireEvent.submit(screen.getByRole("button", { name: "Send message" }).closest("form")!);
}

describe("SmartPark chat widget", () => {
  it("opens on the driver view and answers from live slot state", async () => {
    await renderChat("/driver");

    await openPanel();
    expect(screen.getByText("Driver view")).toBeInTheDocument();

    ask("which bays are free?");

    expect(
      await screen.findByText(/4 of 8 bays are free right now — S01, S03, S05 and S07/),
    ).toBeInTheDocument();
  });

  it("greets operators with a suggestion chip that asks a question", async () => {
    await renderChat("/overview");

    await openPanel();
    fireEvent.click(screen.getByRole("button", { name: "How many spaces are free?" }));

    expect(await screen.findByText(/4 of 8 bays are free/)).toBeInTheDocument();
  });

  it("holds a bay until the visitor confirms, then reserves it", async () => {
    await renderChat("/driver");

    await openPanel();
    ask("reserve S05");

    await waitFor(() => expect(screen.getByTestId("pending")).toHaveTextContent("S05"));

    ask("confirm");

    expect(await screen.findByText(/Bay S05 is reserved for TN 38 AB 1234/)).toBeInTheDocument();
    expect(screen.getByTestId("pending")).toHaveTextContent("none");
  });

  it("releases a held bay when the visitor cancels", async () => {
    await renderChat("/driver");

    await openPanel();
    ask("reserve S05");
    await waitFor(() => expect(screen.getByTestId("pending")).toHaveTextContent("S05"));

    ask("cancel");

    expect(await screen.findByText(/I have released S05/)).toBeInTheDocument();
    expect(screen.getByTestId("pending")).toHaveTextContent("none");
  });

  it("answers pre-sales questions on the landing page", async () => {
    await renderChat("/");

    await openPanel();
    ask("how much for a full day?");

    expect(await screen.findByText(/capped at ₹100 a day/)).toBeInTheDocument();
  });
});
