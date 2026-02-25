"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");
}

export async function getWorkingHours() {
  await requireAdmin();
  return db.workingHour.findMany({ orderBy: { dayOfWeek: "asc" } });
}

export async function upsertWorkingHour(data: {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  active: boolean;
}) {
  await requireAdmin();

  await db.workingHour.upsert({
    where: { dayOfWeek: data.dayOfWeek },
    update: { startTime: data.startTime, endTime: data.endTime, active: data.active },
    create: data,
  });

  revalidatePath("/admin/horarios");
  return { success: true };
}

export async function getBlockedDates() {
  await requireAdmin();
  return db.blockedDate.findMany({ orderBy: { date: "asc" } });
}

export async function createBlockedDate(data: { date: string; reason?: string }) {
  await requireAdmin();
  await db.blockedDate.create({
    data: { date: new Date(data.date + "T00:00:00Z"), reason: data.reason },
  });
  revalidatePath("/admin/dias-bloqueados");
  return { success: true };
}

export async function deleteBlockedDate(id: string) {
  await requireAdmin();
  await db.blockedDate.delete({ where: { id } });
  revalidatePath("/admin/dias-bloqueados");
  return { success: true };
}

// Usado desde el booking público (sin auth)
export async function getActiveDaysOfWeek(): Promise<number[]> {
  const wh = await db.workingHour.findMany({ where: { active: true } });
  return wh.map((w) => w.dayOfWeek);
}

export async function getBlockedDatesPublic(): Promise<string[]> {
  const blocked = await db.blockedDate.findMany({
    where: { date: { gte: new Date() } },
  });
  return blocked.map((b) => b.date.toISOString().split("T")[0]);
}
