import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock DB and auth before importing actions
vi.mock("@/lib/db", () => ({
  db: {
    service: {
      findMany: vi.fn(),
      create: vi.fn(),
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
import { getServices, createService, updateService, deleteService } from "@/actions/services";

const mockAuth = auth as ReturnType<typeof vi.fn>;
const mockDb = db as unknown as {
  service: {
    findMany: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
};

describe("services actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({ user: { id: "admin" } });
  });

  describe("getServices", () => {
    it("returns services with price as number", async () => {
      const raw = [{ id: "1", name: "Corte", durationMinutes: 30, price: { valueOf: () => 1500 }, active: true, order: 0, createdAt: new Date() }];
      // Simulate Prisma Decimal
      const rawWithDecimal = raw.map(s => ({ ...s, price: { toString: () => "1500" } }));
      mockDb.service.findMany.mockResolvedValue(rawWithDecimal);

      const result = await getServices();
      expect(mockDb.service.findMany).toHaveBeenCalled();
      expect(result[0].price).toEqual(expect.any(Number));
    });

    it("filters active services when onlyActive=true", async () => {
      mockDb.service.findMany.mockResolvedValue([]);
      await getServices(true);
      expect(mockDb.service.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { active: true } })
      );
    });
  });

  describe("createService", () => {
    it("requires admin session", async () => {
      mockAuth.mockResolvedValue(null);
      await expect(createService({ name: "Corte", durationMinutes: 30, price: 1500 })).rejects.toThrow("No autorizado");
    });

    it("returns error for invalid data", async () => {
      const result = await createService({ name: "A", durationMinutes: 5, price: -10 });
      expect(result).toEqual({ success: false, error: "Datos inválidos" });
    });

    it("creates service with valid data", async () => {
      mockDb.service.create.mockResolvedValue({});
      const result = await createService({ name: "Corte", durationMinutes: 30, price: 1500 });
      expect(result).toEqual({ success: true });
      expect(mockDb.service.create).toHaveBeenCalled();
    });
  });

  describe("updateService", () => {
    it("requires admin session", async () => {
      mockAuth.mockResolvedValue(null);
      await expect(updateService("id1", { name: "X" })).rejects.toThrow("No autorizado");
    });

    it("updates service when authenticated", async () => {
      mockDb.service.update.mockResolvedValue({});
      const result = await updateService("id1", { active: false });
      expect(result).toEqual({ success: true });
      expect(mockDb.service.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: "id1" } })
      );
    });
  });

  describe("deleteService", () => {
    it("requires admin session", async () => {
      mockAuth.mockResolvedValue(null);
      await expect(deleteService("id1")).rejects.toThrow("No autorizado");
    });

    it("deletes service when authenticated", async () => {
      mockDb.service.delete.mockResolvedValue({});
      const result = await deleteService("id1");
      expect(result).toEqual({ success: true });
    });

    it("returns error when service has associated appointments", async () => {
      mockDb.service.delete.mockRejectedValue(new Error("Foreign key constraint"));
      const result = await deleteService("id1");
      expect(result).toEqual({ success: false, error: "No se puede eliminar: tiene turnos asociados" });
    });
  });
});
