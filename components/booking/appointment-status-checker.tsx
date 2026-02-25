"use client";

import { useState } from "react";
import { getAppointmentByPhone, cancelAppointment } from "@/actions/booking";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, CheckCircle2, AlertCircle, XCircle, Clock } from "lucide-react";

type AppointmentInfo = {
  id: string;
  clientName: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  createdAt: string;
};

const statusConfig = {
  PENDING: {
    label: "Pendiente de aprobación",
    icon: AlertCircle,
    color: "text-amber-400",
    bg: "bg-amber-400/10 border-amber-400/30",
    description: "Tu solicitud está siendo revisada por el peluquero.",
  },
  CONFIRMED: {
    label: "Turno confirmado",
    icon: CheckCircle2,
    color: "text-green-400",
    bg: "bg-green-400/10 border-green-400/30",
    description: "¡Tu turno está confirmado! Te esperamos.",
  },
  REJECTED: {
    label: "No disponible",
    icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-400/10 border-red-400/30",
    description: "Lamentablemente no podemos atenderte en ese horario.",
  },
  CANCELLED: {
    label: "Cancelado",
    icon: XCircle,
    color: "text-zinc-400",
    bg: "bg-zinc-700/50 border-zinc-600",
    description: "El turno fue cancelado.",
  },
} as const;

export function AppointmentStatusChecker() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [appointment, setAppointment] = useState<AppointmentInfo | null>(null);
  const [searched, setSearched] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    setSearched(false);

    const result = await getAppointmentByPhone(phone);
    setLoading(false);
    setSearched(true);
    setAppointment(result);
  }

  async function handleCancel() {
    if (!appointment) return;
    setCancelling(true);
    const result = await cancelAppointment(appointment.id, phone);
    setCancelling(false);

    if (result.success) {
      toast.success("Turno cancelado");
      setAppointment(null);
      setSearched(false);
      setPhone("");
    } else {
      toast.error(result.error);
    }
  }

  const statusInfo = appointment
    ? statusConfig[appointment.status as keyof typeof statusConfig]
    : null;

  return (
    <div className="space-y-6">
      {/* Form */}
      <form
        onSubmit={handleSearch}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4"
      >
        <div>
          <Label className="text-zinc-300">Número de teléfono</Label>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Ej: 2241XXXXXX"
            type="tel"
            className="mt-1.5 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-amber-400"
          />
        </div>
        <Button
          type="submit"
          disabled={!phone.trim() || loading}
          className="w-full bg-amber-400 hover:bg-amber-300 text-zinc-900 font-bold cursor-pointer"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Buscar turno
        </Button>
      </form>

      {/* Result */}
      {searched && !appointment && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center text-zinc-500">
          <Clock className="w-10 h-10 mx-auto mb-3 text-zinc-700" />
          <p>No encontramos turnos activos para ese número.</p>
          <a href="/" className="text-amber-400 hover:underline text-sm mt-2 block">
            Reservar un turno →
          </a>
        </div>
      )}

      {appointment && statusInfo && (
        <div className={`border rounded-2xl p-6 space-y-4 ${statusInfo.bg}`}>
          <div className="flex items-center gap-3">
            <statusInfo.icon className={`w-6 h-6 ${statusInfo.color}`} />
            <div>
              <p className={`font-bold ${statusInfo.color}`}>{statusInfo.label}</p>
              <p className="text-xs text-zinc-400">{statusInfo.description}</p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <DetailRow label="Nombre" value={appointment.clientName} />
            <DetailRow label="Servicio" value={appointment.serviceName} />
            <DetailRow label="Fecha" value={appointment.appointmentDate} />
            <DetailRow label="Hora" value={`${appointment.appointmentTime} hs`} />
          </div>

          {["PENDING", "CONFIRMED"].includes(appointment.status) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={cancelling}
              className="border-red-500/40 text-red-400 hover:bg-red-500/10 hover:text-red-300 cursor-pointer"
            >
              {cancelling && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
              Cancelar turno
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-zinc-500">{label}</span>
      <span className="text-white font-medium">{value}</span>
    </div>
  );
}
