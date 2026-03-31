import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    workingHour: {
      findMany: vi.fn(),
      upsert: vi.fn(),
    },
    blockedDate: {
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  getWorkingHours,
  upsertWorkingHour,
  getBlockedDates,
  createBlockedDate,
  deleteBlockedDate,
  getActiveDaysOfWeek,
  getBlockedDatesPublic,
} from "@/actions/schedule";

const mockAuth = auth as ReturnType<typeof vi.fn>;
const mockWH = (db as any).workingHour;
const mockBD = (db as any).blockedDate;

describe("schedule actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({ user: { id: "admin" } });
  });

  describe("getWorkingHours", () => {
    it("requires admin", async () => {
      mockAuth.mockResolvedValue(null);
      await expect(getWorkingHours()).rejects.toThrow("No autorizado");
    });

    it("returns working hours ordered by dayOfWeek", async () => {
      const hours = [{ id: "1", dayOfWeek: 1, startTime: "09:00", endTime: "18:00", active: true }];
      mockWH.findMany.mockResolvedValue(hours);
      const result = await getWorkingHours();
      expect(result).toEqual(hours);
      expect(mockWH.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { dayOfWeek: "asc" } })
      );
    });
  });

  describe("upsertWorkingHour", () => {
    it("requires admin", async () => {
      mockAuth.mockResolvedValue(null);
      await expect(upsertWorkingHour({ dayOfWeek: 1, startTime: "09:00", endTime: "18:00", active: true })).rejects.toThrow("No autorizado");
    });

    it("upserts working hour", async () => {
      mockWH.upsert.mockResolvedValue({});
      const result = await upsertWorkingHour({ dayOfWeek: 1, startTime: "09:00", endTime: "18:00", active: true });
      expect(result).toEqual({ success: true });
      expect(mockWH.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ where: { dayOfWeek: 1 } })
      );
    });
  });

  describe("getBlockedDates", () => {
    it("requires admin", async () => {
      mockAuth.mockResolvedValue(null);
      await expect(getBlockedDates()).rejects.toThrow("No autorizado");
    });

    it("returns blocked dates", async () => {
      mockBD.findMany.mockResolvedValue([{ id: "1", date: new Date("2026-04-20"), reason: "Feriado" }]);
      const result = await getBlockedDates();
      expect(result).toHaveLength(1);
    });
  });

  describe("createBlockedDate", () => {
    it("requires admin", async () => {
      mockAuth.mockResolvedValue(null);
      await expect(createBlockedDate({ date: "2026-04-20" })).rejects.toThrow("No autorizado");
    });

    it("creates blocked date with reason", async () => {
      mockBD.create.mockResolvedValue({});
      const result = await createBlockedDate({ date: "2026-04-20", reason: "Feriado" });
      expect(result).toEqual({ success: true });
      expect(mockBD.create).toHaveBeenCalled();
    });
  });

  describe("deleteBlockedDate", () => {
    it("requires admin", async () => {
      mockAuth.mockResolvedValue(null);
      await expect(deleteBlockedDate("id1")).rejects.toThrow("No autorizado");
    });

    it("deletes blocked date", async () => {
      mockBD.delete.mockResolvedValue({});
      const result = await deleteBlockedDate("id1");
      expect(result).toEqual({ success: true });
    });
  });

  describe("getActiveDaysOfWeek (public)", () => {
    it("returns active day numbers without auth", async () => {
      mockWH.findMany.mockResolvedValue([
        { dayOfWeek: 1 },
        { dayOfWeek: 2 },
        { dayOfWeek: 5 },
      ]);
      const result = await getActiveDaysOfWeek();
      expect(result).toEqual([1, 2, 5]);
    });
  });

  describe("getBlockedDatesPublic (public)", () => {
    it("returns future blocked dates as ISO strings without auth", async () => {
      mockBD.findMany.mockResolvedValue([
        { date: new Date("2026-05-01T00:00:00Z") },
        { date: new Date("2026-06-15T00:00:00Z") },
      ]);
      const result = await getBlockedDatesPublic();
      expect(result).toEqual(["2026-05-01", "2026-06-15"]);
    });
  });
});
