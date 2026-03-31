import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    knownClient: {
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
import {
  getKnownClients,
  createKnownClient,
  updateKnownClient,
  deleteKnownClient,
} from "@/actions/known-clients";

const mockAuth = auth as ReturnType<typeof vi.fn>;
const mockClient = (db as any).knownClient;

describe("known-clients actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({ user: { id: "admin" } });
  });

  describe("getKnownClients", () => {
    it("requires admin", async () => {
      mockAuth.mockResolvedValue(null);
      await expect(getKnownClients()).rejects.toThrow("No autorizado");
    });

    it("returns clients ordered by createdAt desc", async () => {
      mockClient.findMany.mockResolvedValue([{ id: "1", phone: "2291234567", name: "Juan" }]);
      const result = await getKnownClients();
      expect(result).toHaveLength(1);
      expect(mockClient.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { createdAt: "desc" } })
      );
    });
  });

  describe("createKnownClient", () => {
    it("requires admin", async () => {
      mockAuth.mockResolvedValue(null);
      await expect(createKnownClient({ phone: "2291234567" })).rejects.toThrow("No autorizado");
    });

    it("returns error for invalid phone (too short)", async () => {
      const result = await createKnownClient({ phone: "123" });
      expect(result).toEqual({ success: false, error: "Datos inválidos" });
    });

    it("creates client with valid data", async () => {
      mockClient.create.mockResolvedValue({});
      const result = await createKnownClient({ phone: "2291234567", name: "Juan" });
      expect(result).toEqual({ success: true });
      expect(mockClient.create).toHaveBeenCalled();
    });

    it("returns error when phone already exists", async () => {
      mockClient.create.mockRejectedValue(new Error("Unique constraint"));
      const result = await createKnownClient({ phone: "2291234567" });
      expect(result).toEqual({ success: false, error: "El teléfono ya existe en la lista" });
    });
  });

  describe("updateKnownClient", () => {
    it("requires admin", async () => {
      mockAuth.mockResolvedValue(null);
      await expect(updateKnownClient("id1", { name: "Pedro" })).rejects.toThrow("No autorizado");
    });

    it("updates client", async () => {
      mockClient.update.mockResolvedValue({});
      const result = await updateKnownClient("id1", { name: "Pedro" });
      expect(result).toEqual({ success: true });
    });

    it("returns error on update failure", async () => {
      mockClient.update.mockRejectedValue(new Error("DB error"));
      const result = await updateKnownClient("id1", { phone: "dup" });
      expect(result).toEqual({ success: false, error: "Error al actualizar" });
    });
  });

  describe("deleteKnownClient", () => {
    it("requires admin", async () => {
      mockAuth.mockResolvedValue(null);
      await expect(deleteKnownClient("id1")).rejects.toThrow("No autorizado");
    });

    it("deletes client by id", async () => {
      mockClient.delete.mockResolvedValue({});
      const result = await deleteKnownClient("id1");
      expect(result).toEqual({ success: true });
    });
  });
});
