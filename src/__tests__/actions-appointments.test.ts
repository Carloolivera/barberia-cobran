import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    appointment: {
      findMany: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
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
  getAppointments,
  getDashboardStats,
  approveAppointment,
  rejectAppointment,
  completeAppointment,
  addNoteToAppointment,
  deleteAppointment,
} from "@/actions/appointments";

const mockAuth = auth as ReturnType<typeof vi.fn>;
const mockAppointment = (db as any).appointment;

const makeAppt = (overrides = {}) => ({
  id: "appt1",
  clientName: "Juan",
  clientPhone: "2291234567",
  service: { name: "Corte", durationMinutes: 30 },
  appointmentDate: new Date("2026-04-15T00:00:00Z"),
  appointmentTime: "10:00",
  status: "PENDING",
  isKnownClient: false,
  notes: null,
  createdAt: new Date(),
  ...overrides,
});

describe("appointments actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({ user: { id: "admin" } });
  });

  describe("getAppointments", () => {
    it("requires admin", async () => {
      mockAuth.mockResolvedValue(null);
      await expect(getAppointments()).rejects.toThrow("No autorizado");
    });

    it("returns mapped appointments", async () => {
      mockAppointment.findMany.mockResolvedValue([makeAppt()]);
      const result = await getAppointments();
      expect(result).toHaveLength(1);
      expect(result[0].clientName).toBe("Juan");
      expect(result[0].appointmentDate).toBe("15/04/2026");
    });

    it("passes status filter to DB", async () => {
      mockAppointment.findMany.mockResolvedValue([]);
      await getAppointments({ status: "CONFIRMED" });
      expect(mockAppointment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ status: "CONFIRMED" }) })
      );
    });

    it("ignores 'all' as status filter", async () => {
      mockAppointment.findMany.mockResolvedValue([]);
      await getAppointments({ status: "all" });
      const callArg = mockAppointment.findMany.mock.calls[0][0];
      expect(callArg.where.status).toBeUndefined();
    });
  });

  describe("getDashboardStats", () => {
    it("requires admin", async () => {
      mockAuth.mockResolvedValue(null);
      await expect(getDashboardStats()).rejects.toThrow("No autorizado");
    });

    it("returns pending, todayConfirmed, totalThisMonth", async () => {
      mockAppointment.count
        .mockResolvedValueOnce(3)  // pending
        .mockResolvedValueOnce(5)  // todayConfirmed
        .mockResolvedValueOnce(20); // totalThisMonth
      const result = await getDashboardStats();
      expect(result).toEqual({ pending: 3, todayConfirmed: 5, totalThisMonth: 20 });
    });
  });

  describe("approveAppointment", () => {
    it("requires admin", async () => {
      mockAuth.mockResolvedValue(null);
      await expect(approveAppointment("id1")).rejects.toThrow("No autorizado");
    });

    it("updates status to CONFIRMED", async () => {
      mockAppointment.update.mockResolvedValue({});
      const result = await approveAppointment("id1");
      expect(result).toEqual({ success: true });
      expect(mockAppointment.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: "CONFIRMED" } })
      );
    });
  });

  describe("rejectAppointment", () => {
    it("updates status to REJECTED with optional reason", async () => {
      mockAppointment.update.mockResolvedValue({});
      await rejectAppointment("id1", "No hay lugar");
      expect(mockAppointment.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: "REJECTED", notes: "No hay lugar" } })
      );
    });
  });

  describe("completeAppointment", () => {
    it("updates status to COMPLETED", async () => {
      mockAppointment.update.mockResolvedValue({});
      const result = await completeAppointment("id1");
      expect(result).toEqual({ success: true });
      expect(mockAppointment.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: "COMPLETED" } })
      );
    });
  });

  describe("addNoteToAppointment", () => {
    it("saves note to appointment", async () => {
      mockAppointment.update.mockResolvedValue({});
      await addNoteToAppointment("id1", "Cliente puntual");
      expect(mockAppointment.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { notes: "Cliente puntual" } })
      );
    });
  });

  describe("deleteAppointment", () => {
    it("requires admin", async () => {
      mockAuth.mockResolvedValue(null);
      await expect(deleteAppointment("id1")).rejects.toThrow("No autorizado");
    });

    it("deletes appointment by id", async () => {
      (db as any).appointment.delete = vi.fn().mockResolvedValue({});
      const result = await deleteAppointment("id1");
      expect(result).toEqual({ success: true });
    });
  });
});
