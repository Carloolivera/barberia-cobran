"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");
}

export async function getAppointments(filters?: {
  status?: string;
  date?: string;
}) {
  await requireAdmin();

  const where: Record<string, unknown> = {};
  if (filters?.status && filters.status !== "all") {
    where.status = filters.status;
  }
  if (filters?.date) {
    where.appointmentDate = new Date(filters.date + "T00:00:00Z");
  }

  const appointments = await db.appointment.findMany({
    where,
    include: { service: true },
    orderBy: [{ appointmentDate: "asc" }, { appointmentTime: "asc" }],
  });

  return appointments.map((a) => ({
    id: a.id,
    clientName: a.clientName,
    clientPhone: a.clientPhone,
    serviceName: a.service.name,
    durationMinutes: a.service.durationMinutes,
    appointmentDate: (() => { const iso = a.appointmentDate.toISOString().split("T")[0]; const [y,m,d] = iso.split("-"); return `${d}/${m}/${y}`; })(),
    appointmentTime: a.appointmentTime,
    status: a.status,
    isKnownClient: a.isKnownClient,
    notes: a.notes,
    createdAt: a.createdAt.toISOString(),
  }));
}

export async function getDashboardStats() {
  await requireAdmin();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayUTC = new Date(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  );

  const [pending, todayConfirmed, totalThisMonth] = await Promise.all([
    db.appointment.count({ where: { status: "PENDING" } }),
    db.appointment.count({
      where: { appointmentDate: todayUTC, status: "CONFIRMED" },
    }),
    db.appointment.count({
      where: {
        createdAt: { gte: new Date(today.getFullYear(), today.getMonth(), 1) },
      },
    }),
  ]);

  return { pending, todayConfirmed, totalThisMonth };
}

export async function approveAppointment(id: string) {
  await requireAdmin();

  await db.appointment.update({
    where: { id },
    data: { status: "CONFIRMED" },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/turnos");
  return { success: true };
}

export async function rejectAppointment(id: string, reason?: string) {
  await requireAdmin();

  await db.appointment.update({
    where: { id },
    data: { status: "REJECTED", notes: reason },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/turnos");
  return { success: true };
}

export async function completeAppointment(id: string) {
  await requireAdmin();

  await db.appointment.update({
    where: { id },
    data: { status: "COMPLETED" },
  });

  revalidatePath("/admin/turnos");
  return { success: true };
}

export async function addNoteToAppointment(id: string, notes: string) {
  await requireAdmin();

  await db.appointment.update({
    where: { id },
    data: { notes },
  });

  revalidatePath("/admin/turnos");
  return { success: true };
}
