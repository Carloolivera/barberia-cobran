import { describe, it, expect } from "vitest";

// Pure function extracted from getAvailableSlots — tested without DB
function computeAvailableSlots(
  workingHour: { startTime: string; endTime: string },
  serviceDurationMinutes: number,
  confirmedAppointments: Array<{ appointmentTime: string; durationMinutes: number }>
): string[] {
  const [startH, startM] = workingHour.startTime.split(":").map(Number);
  const [endH, endM] = workingHour.endTime.split(":").map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  const slots: string[] = [];
  for (let m = startMinutes; m + serviceDurationMinutes <= endMinutes; m += 30) {
    const h = Math.floor(m / 60).toString().padStart(2, "0");
    const min = (m % 60).toString().padStart(2, "0");
    slots.push(`${h}:${min}`);
  }

  const occupiedSlots = new Set<string>();
  for (const appt of confirmedAppointments) {
    const [apptH, apptM] = appt.appointmentTime.split(":").map(Number);
    const apptStart = apptH * 60 + apptM;
    const apptEnd = apptStart + appt.durationMinutes;
    for (let m = apptStart; m < apptEnd; m += 30) {
      const h = Math.floor(m / 60).toString().padStart(2, "0");
      const min = (m % 60).toString().padStart(2, "0");
      occupiedSlots.add(`${h}:${min}`);
    }
  }

  return slots.filter((slot) => !occupiedSlots.has(slot));
}

const workDay = { startTime: "09:00", endTime: "18:00" };

describe("computeAvailableSlots", () => {
  it("generates correct slots for a full day with 30-min service", () => {
    const slots = computeAvailableSlots(workDay, 30, []);
    expect(slots[0]).toBe("09:00");
    expect(slots[slots.length - 1]).toBe("17:30");
    expect(slots).toHaveLength(18); // 9h × 2 slots/h = 18
  });

  it("generates correct slots for a 60-min service", () => {
    const slots = computeAvailableSlots(workDay, 60, []);
    expect(slots[0]).toBe("09:00");
    expect(slots[slots.length - 1]).toBe("17:00");
    expect(slots).toHaveLength(17);
  });

  it("removes occupied slot when appointment exists", () => {
    const appts = [{ appointmentTime: "10:00", durationMinutes: 30 }];
    const slots = computeAvailableSlots(workDay, 30, appts);
    expect(slots).not.toContain("10:00");
    expect(slots).toContain("09:30");
    expect(slots).toContain("10:30");
  });

  it("blocks multiple slots for a long appointment (60-min)", () => {
    const appts = [{ appointmentTime: "10:00", durationMinutes: 60 }];
    const slots = computeAvailableSlots(workDay, 30, appts);
    expect(slots).not.toContain("10:00");
    expect(slots).not.toContain("10:30");
    expect(slots).toContain("09:30");
    expect(slots).toContain("11:00");
  });

  it("returns empty array when entire day is occupied", () => {
    // One giant appointment covering the whole day
    const appts = [{ appointmentTime: "09:00", durationMinutes: 9 * 60 }];
    const slots = computeAvailableSlots(workDay, 30, appts);
    expect(slots).toHaveLength(0);
  });

  it("handles multiple concurrent appointments correctly", () => {
    const appts = [
      { appointmentTime: "09:00", durationMinutes: 30 },
      { appointmentTime: "10:00", durationMinutes: 30 },
      { appointmentTime: "11:00", durationMinutes: 30 },
    ];
    const slots = computeAvailableSlots(workDay, 30, appts);
    expect(slots).not.toContain("09:00");
    expect(slots).not.toContain("10:00");
    expect(slots).not.toContain("11:00");
    expect(slots).toContain("09:30");
    expect(slots).toContain("10:30");
    expect(slots).toContain("11:30");
  });

  it("does not offer slot if service would overflow end of day", () => {
    // 90-min service: last valid start is 16:30 (16:30 + 90 = 18:00)
    const slots = computeAvailableSlots(workDay, 90, []);
    expect(slots).toContain("16:30");
    expect(slots).not.toContain("17:00");
    expect(slots).not.toContain("17:30");
  });

  it("returns empty when start equals end (zero-length day)", () => {
    const slots = computeAvailableSlots({ startTime: "09:00", endTime: "09:00" }, 30, []);
    expect(slots).toHaveLength(0);
  });
});
