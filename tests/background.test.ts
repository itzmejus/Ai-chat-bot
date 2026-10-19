import { afterEach, describe, expect, it, vi } from "vitest";

const next = vi.hoisted(() => ({ inRequest: true, scheduled: [] as (() => unknown)[] }));
vi.mock("next/server", () => ({
  after: (task: () => unknown) => {
    if (!next.inRequest) throw new Error("`after` was called outside a request scope");
    next.scheduled.push(task);
  },
}));

import { inBackground } from "@/server/background";

afterEach(() => {
  next.inRequest = true;
  next.scheduled = [];
  vi.restoreAllMocks();
});

describe("background work", () => {
  it("hands the work to after() during a request, so the host keeps it running", async () => {
    const work = vi.fn(async () => {});
    inBackground("test", work);
    expect(work).not.toHaveBeenCalled(); // not before the response
    expect(next.scheduled).toHaveLength(1);
    await next.scheduled[0]();
    expect(work).toHaveBeenCalledOnce();
  });

  it("starts the work at once outside a request", () => {
    next.inRequest = false;
    const work = vi.fn(async () => {});
    inBackground("test", work);
    expect(work).toHaveBeenCalledOnce();
  });

  it("logs a failure instead of throwing it", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    inBackground("notify", async () => {
      throw new Error("smtp down");
    });
    await expect(next.scheduled[0]()).resolves.toBeUndefined();
    expect(log).toHaveBeenCalledWith("[notify] failed", expect.objectContaining({ message: "smtp down" }));
  });
});
