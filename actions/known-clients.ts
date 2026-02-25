"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");
}

const clientSchema = z.object({
  phone: z.string().min(6).max(20),
  name: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});

export async function getKnownClients() {
  await requireAdmin();
  return db.knownClient.findMany({ orderBy: { createdAt: "desc" } });
}

export async function createKnownClient(data: {
  phone: string;
  name?: string;
  notes?: string;
}) {
  await requireAdmin();
  const parsed = clientSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Datos inválidos" };

  try {
    await db.knownClient.create({ data: parsed.data });
    revalidatePath("/admin/clientes");
    return { success: true };
  } catch {
    return { success: false, error: "El teléfono ya existe en la lista" };
  }
}

export async function updateKnownClient(
  id: string,
  data: { phone?: string; name?: string; notes?: string }
) {
  await requireAdmin();

  try {
    await db.knownClient.update({ where: { id }, data });
    revalidatePath("/admin/clientes");
    return { success: true };
  } catch {
    return { success: false, error: "Error al actualizar" };
  }
}

export async function deleteKnownClient(id: string) {
  await requireAdmin();
  await db.knownClient.delete({ where: { id } });
  revalidatePath("/admin/clientes");
  return { success: true };
}
