import { describe, it, expect, beforeEach, vi } from "vitest";

// We test the module in isolation — import after vi.resetModules() per test
describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("allows the first request from an IP", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    const result = checkRateLimit("1.2.3.4");
    expect(result.allowed).toBe(true);
  });

  it("allows up to MAX_ATTEMPTS (5) requests", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    const ip = "10.0.0.1";
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(ip).allowed).toBe(true);
    }
  });

  it("blocks on the 6th attempt", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    const ip = "10.0.0.2";
    for (let i = 0; i < 5; i++) checkRateLimit(ip);
    const result = checkRateLimit(ip);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  it("resets counter after successful login", async () => {
    const { checkRateLimit, resetRateLimit } = await import("@/lib/rate-limit");
    const ip = "10.0.0.3";
    for (let i = 0; i < 3; i++) checkRateLimit(ip);
    resetRateLimit(ip);
    // After reset, should be allowed again from count 1
    expect(checkRateLimit(ip).allowed).toBe(true);
  });

  it("different IPs have independent counters", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    const ip1 = "192.168.1.1";
    const ip2 = "192.168.1.2";
    for (let i = 0; i < 5; i++) checkRateLimit(ip1);
    checkRateLimit(ip1); // blocked
    // ip2 should still be allowed
    expect(checkRateLimit(ip2).allowed).toBe(true);
  });

  it("lookup: prefix isolates booking lookups from auth", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    const ip = "10.0.0.4";
    // Exhaust auth limit
    for (let i = 0; i < 6; i++) checkRateLimit(ip);
    // Lookup prefix is a different bucket
    expect(checkRateLimit(`lookup:${ip}`).allowed).toBe(true);
  });
});
