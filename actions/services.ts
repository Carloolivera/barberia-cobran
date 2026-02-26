"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");
}

const serviceSchema = z.object({
  name: z.string().min(2).max(100),
  durationMinutes: z.number().int().min(10).max(240),
  price: z.number().min(0),
  active: z.boolean().optional(),
  order: z.number().int().optional(),
});

export async function getServices(onlyActive = false) {
  const services = await db.service.findMany({
    where: onlyActive ? { active: true } : undefined,
    orderBy: { order: "asc" },
  });
  // Convert Decimal → number so it's serializable to Client Components
  return services.map((s) => ({ ...s, price: Number(s.price) }));
}

export async function createService(data: {
  name: string;
  durationMinutes: number;
  price: number;
}) {
  await requireAdmin();
  const parsed = serviceSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Datos inválidos" };

  await db.service.create({ data: parsed.data });
  revalidatePath("/admin/servicios");
  return { success: true };
}

export async function updateService(
  id: string,
  data: {
    name?: string;
    durationMinutes?: number;
    price?: number;
    active?: boolean;
    order?: number;
  }
) {
  await requireAdmin();
  await db.service.update({ where: { id }, data });
  revalidatePath("/admin/servicios");
  return { success: true };
}

export async function deleteService(id: string) {
  await requireAdmin();
  try {
    await db.service.delete({ where: { id } });
    revalidatePath("/admin/servicios");
    return { success: true };
  } catch {
    return { success: false, error: "No se puede eliminar: tiene turnos asociados" };
  }
}
