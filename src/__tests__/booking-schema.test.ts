import { describe, it, expect } from "vitest";
import { z } from "zod";

// Mirror the schema from actions/booking.ts — tested in isolation
const bookingSchema = z.object({
  serviceId: z.string().min(1),
  appointmentDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((d) => {
      const year = parseInt(d.split("-")[0]);
      return year >= 2025 && year <= 2030;
    }, "Fecha inválida"),
  appointmentTime: z.string().regex(/^\d{2}:\d{2}$/),
  clientName: z.string().min(2).max(100),
  clientPhone: z.string().min(6).max(20),
});

const validPayload = {
  serviceId: "clx123",
  appointmentDate: "2026-04-15",
  appointmentTime: "10:30",
  clientName: "Juan Pérez",
  clientPhone: "2291234567",
};

describe("bookingSchema", () => {
  it("accepts a valid payload", () => {
    expect(bookingSchema.safeParse(validPayload).success).toBe(true);
  });

  it("rejects empty serviceId", () => {
    const result = bookingSchema.safeParse({ ...validPayload, serviceId: "" });
    expect(result.success).toBe(false);
  });

  it("rejects date in wrong format", () => {
    const result = bookingSchema.safeParse({ ...validPayload, appointmentDate: "15/04/2026" });
    expect(result.success).toBe(false);
  });

  it("rejects date before 2025", () => {
    const result = bookingSchema.safeParse({ ...validPayload, appointmentDate: "2024-12-31" });
    expect(result.success).toBe(false);
  });

  it("rejects date after 2030", () => {
    const result = bookingSchema.safeParse({ ...validPayload, appointmentDate: "2031-01-01" });
    expect(result.success).toBe(false);
  });

  it("rejects time in wrong format", () => {
    const result = bookingSchema.safeParse({ ...validPayload, appointmentTime: "10:3" });
    expect(result.success).toBe(false);
  });

  it("rejects clientName shorter than 2 chars", () => {
    const result = bookingSchema.safeParse({ ...validPayload, clientName: "J" });
    expect(result.success).toBe(false);
  });

  it("rejects clientPhone shorter than 6 chars", () => {
    const result = bookingSchema.safeParse({ ...validPayload, clientPhone: "123" });
    expect(result.success).toBe(false);
  });

  it("rejects clientPhone longer than 20 chars", () => {
    const result = bookingSchema.safeParse({ ...validPayload, clientPhone: "1".repeat(21) });
    expect(result.success).toBe(false);
  });

  it("accepts time at midnight 00:00", () => {
    const result = bookingSchema.safeParse({ ...validPayload, appointmentTime: "00:00" });
    expect(result.success).toBe(true);
  });

  it("accepts time at end of day 23:59", () => {
    const result = bookingSchema.safeParse({ ...validPayload, appointmentTime: "23:59" });
    expect(result.success).toBe(true);
  });
});
