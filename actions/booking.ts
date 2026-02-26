"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

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

// Format "YYYY-MM-DD" → "DD/MM/YYYY" for display
function formatDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-");
  if (!y || !m || !d) return isoDate;
  return `${d}/${m}/${y}`;
}

export async function getAvailableSlots(serviceId: string, dateStr: string) {
  if (!serviceId || !dateStr) return [];

  const date = new Date(dateStr + "T00:00:00");
  const dayOfWeek = date.getDay(); // 0=Dom, 1=Lun...

  const [workingHour, service, blockedDate, confirmedAppts] = await Promise.all([
    db.workingHour.findFirst({ where: { dayOfWeek, active: true } }),
    db.service.findUnique({ where: { id: serviceId } }),
    db.blockedDate.findFirst({
      where: { date: new Date(dateStr + "T00:00:00Z") },
    }),
    db.appointment.findMany({
      where: {
        appointmentDate: new Date(dateStr + "T00:00:00Z"),
        status: { in: ["CONFIRMED", "PENDING"] },
      },
      include: { service: true },
    }),
  ]);

  if (!workingHour || !service || blockedDate) return [];

  // Generar todos los slots del día
  const slots: string[] = [];
  const [startH, startM] = workingHour.startTime.split(":").map(Number);
  const [endH, endM] = workingHour.endTime.split(":").map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  for (let m = startMinutes; m + service.durationMinutes <= endMinutes; m += 30) {
    const h = Math.floor(m / 60).toString().padStart(2, "0");
    const min = (m % 60).toString().padStart(2, "0");
    slots.push(`${h}:${min}`);
  }

  // Filtrar slots ocupados
  const occupiedSlots = new Set<string>();
  for (const appt of confirmedAppts) {
    const [apptH, apptM] = appt.appointmentTime.split(":").map(Number);
    const apptStart = apptH * 60 + apptM;
    const apptEnd = apptStart + appt.service.durationMinutes;

    // Marcar todos los slots que se superponen con este turno
    for (let m = apptStart; m < apptEnd; m += 30) {
      const h = Math.floor(m / 60).toString().padStart(2, "0");
      const min = (m % 60).toString().padStart(2, "0");
      occupiedSlots.add(`${h}:${min}`);
    }
  }

  return slots.filter((slot) => !occupiedSlots.has(slot));
}

export async function createAppointment(formData: {
  serviceId: string;
  appointmentDate: string;
  appointmentTime: string;
  clientName: string;
  clientPhone: string;
}) {
  const parsed = bookingSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: "Datos inválidos" };
  }

  const { serviceId, appointmentDate, appointmentTime, clientName, clientPhone } = parsed.data;

  // Verificar que el slot sigue disponible (anti race-condition)
  const available = await getAvailableSlots(serviceId, appointmentDate);
  if (!available.includes(appointmentTime)) {
    return { success: false, error: "El horario ya no está disponible. Por favor elegí otro." };
  }

  // Verificar si es cliente conocido
  const knownClient = await db.knownClient.findFirst({
    where: { phone: clientPhone.trim() },
  });

  const isKnown = !!knownClient;
  const status = isKnown ? "CONFIRMED" : "PENDING";

  const appointment = await db.appointment.create({
    data: {
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      serviceId,
      appointmentDate: new Date(appointmentDate + "T00:00:00Z"),
      appointmentTime,
      status,
      isKnownClient: isKnown,
    },
    include: { service: true },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/turnos");

  return {
    success: true,
    status,
    appointment: {
      id: appointment.id,
      clientName: appointment.clientName,
      serviceName: appointment.service.name,
      appointmentDate: formatDate(appointmentDate),
      appointmentTime: appointment.appointmentTime,
      status: appointment.status,
    },
  };
}

export async function getAppointmentByPhone(phone: string) {
  if (!phone || phone.trim().length < 6) return null;

  const appointment = await db.appointment.findFirst({
    where: {
      clientPhone: phone.trim(),
      status: { in: ["PENDING", "CONFIRMED"] },
    },
    include: { service: true },
    orderBy: [
      { appointmentDate: "asc" },
      { appointmentTime: "asc" },
    ],
  });

  if (!appointment) return null;

  return {
    id: appointment.id,
    clientName: appointment.clientName,
    serviceName: appointment.service.name,
    appointmentDate: formatDate(appointment.appointmentDate.toISOString().split("T")[0]),
    appointmentTime: appointment.appointmentTime,
    status: appointment.status,
    createdAt: appointment.createdAt.toISOString(),
  };
}

export async function cancelAppointment(appointmentId: string, clientPhone: string) {
  const appointment = await db.appointment.findFirst({
    where: { id: appointmentId, clientPhone: clientPhone.trim() },
  });

  if (!appointment) return { success: false, error: "Turno no encontrado" };
  if (!["PENDING", "CONFIRMED"].includes(appointment.status)) {
    return { success: false, error: "El turno no se puede cancelar" };
  }

  await db.appointment.update({
    where: { id: appointmentId },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/admin/turnos");
  return { success: true };
}
