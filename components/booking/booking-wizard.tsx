"use client";

import { useState } from "react";
import { toast } from "sonner";
import { getAvailableSlots, createAppointment } from "@/actions/booking";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Clock, DollarSign, ChevronLeft, Loader2, AlertCircle } from "lucide-react";

type Service = { id: string; name: string; durationMinutes: number; price: number };

type Props = {
  services: Service[];
  activeDays: number[];
  blockedDates: string[];
};

type BookingResult = {
  status: "CONFIRMED" | "PENDING";
  appointment: {
    clientName: string;
    serviceName: string;
    appointmentDate: string;
    appointmentTime: string;
  };
};

const STEPS = ["Servicio", "Fecha", "Horario", "Datos", "Listo"] as const;

export function BookingWizard({ services, activeDays, blockedDates }: Props) {
  const [step, setStep] = useState(0);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<BookingResult | null>(null);

  const today = new Date().toISOString().split("T")[0];

  function isDateAvailable(dateStr: string): boolean {
    const date = new Date(dateStr + "T00:00:00");
    const dayOfWeek = date.getDay();
    if (blockedDates.includes(dateStr)) return false;
    if (!activeDays.includes(dayOfWeek)) return false;
    return true;
  }

  function getMinDate() {
    // Buscar el próximo día disponible (máx 7 días hacia adelante)
    const d = new Date();
    d.setDate(d.getDate() + 1); // mañana
    for (let i = 0; i < 14; i++) {
      const ds = d.toISOString().split("T")[0];
      if (isDateAvailable(ds)) return ds;
      d.setDate(d.getDate() + 1);
    }
    return "";
  }

  async function handleDateSelect(date: string) {
    setSelectedDate(date);
    setSelectedTime("");
    setSlots([]);

    if (!date || !selectedService) return;
    if (!isDateAvailable(date)) {
      toast.error("Ese día no hay atención");
      return;
    }

    setLoadingSlots(true);
    const available = await getAvailableSlots(selectedService.id, date);
    setLoadingSlots(false);
    setSlots(available);

    if (available.length === 0) {
      toast.error("No quedan horarios disponibles para ese día");
    } else {
      setStep(2);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    const res = await createAppointment({
      serviceId: selectedService!.id,
      appointmentDate: selectedDate,
      appointmentTime: selectedTime,
      clientName,
      clientPhone,
    });
    setSubmitting(false);

    if (!res.success) {
      toast.error(res.error);
      return;
    }

    setResult({
      status: res.status as "CONFIRMED" | "PENDING",
      appointment: res.appointment!,
    });
    setStep(4);
  }

  // --- Step 4: Result ---
  if (step === 4 && result) {
    return (
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 text-center">
        {result.status === "CONFIRMED" ? (
          <>
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">¡Turno confirmado!</h2>
            <p className="text-zinc-400 mb-6">Te esperamos en la barbería</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-zinc-900" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Solicitud recibida</h2>
            <p className="text-zinc-400 mb-6">
              Tu turno está pendiente de confirmación. El peluquero lo revisará pronto.
            </p>
          </>
        )}

        <div className="bg-zinc-800 rounded-xl p-4 text-left space-y-2 mb-6">
          <DetailRow label="Nombre" value={result.appointment.clientName} />
          <DetailRow label="Servicio" value={result.appointment.serviceName} />
          <DetailRow label="Fecha" value={result.appointment.appointmentDate} />
          <DetailRow label="Hora" value={result.appointment.appointmentTime + " hs"} />
          <DetailRow
            label="Estado"
            value={result.status === "CONFIRMED" ? "Confirmado ✓" : "Pendiente de aprobación"}
          />
        </div>

        <a
          href="/mi-turno"
          className="text-amber-400 hover:text-amber-300 text-sm underline"
        >
          Consultá el estado de tu turno →
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Steps indicator */}
      <div className="flex items-center justify-center gap-2">
        {STEPS.slice(0, 4).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                i < step
                  ? "bg-amber-400 text-zinc-900"
                  : i === step
                  ? "bg-amber-400 text-zinc-900"
                  : "bg-zinc-800 text-zinc-500"
              }`}
            >
              {i < step ? "✓" : i + 1}
            </div>
            {i < 3 && <div className={`w-8 h-0.5 ${i < step ? "bg-amber-400" : "bg-zinc-700"}`} />}
          </div>
        ))}
      </div>

      {/* Step 0: Servicio */}
      {step === 0 && (
        <StepCard title="¿Qué servicio necesitás?">
          <div className="space-y-3">
            {services.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedService(s);
                  setStep(1);
                }}
                className="w-full flex items-center justify-between p-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-amber-400 rounded-xl transition-all cursor-pointer group"
              >
                <div className="text-left">
                  <p className="font-semibold text-white group-hover:text-amber-400 transition-colors">
                    {s.name}
                  </p>
                  <p className="text-sm text-zinc-500 flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {s.durationMinutes} min
                    </span>
                  </p>
                </div>
                <div className="text-amber-400 font-bold text-lg">
                  ${s.price.toLocaleString("es-AR")}
                </div>
              </button>
            ))}
          </div>
        </StepCard>
      )}

      {/* Step 1: Fecha */}
      {step === 1 && selectedService && (
        <StepCard
          title="¿Qué día querés venir?"
          back={() => { setStep(0); setSelectedDate(""); setSlots([]); }}
          subtitle={`Servicio: ${selectedService.name}`}
        >
          <div className="space-y-3">
            <p className="text-xs text-zinc-500">
              Días disponibles:{" "}
              {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
                .filter((_, i) => activeDays.includes(i))
                .join(", ")}
            </p>
            <input
              type="date"
              min={getMinDate() || today}
              value={selectedDate}
              onChange={(e) => handleDateSelect(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-base focus:outline-none focus:border-amber-400 cursor-pointer"
            />
            {loadingSlots && (
              <div className="flex items-center justify-center gap-2 text-zinc-400 py-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Buscando horarios...</span>
              </div>
            )}
          </div>
        </StepCard>
      )}

      {/* Step 2: Horario */}
      {step === 2 && selectedDate && (
        <StepCard
          title="¿A qué hora?"
          back={() => { setStep(1); setSelectedTime(""); }}
          subtitle={`${selectedDate} · ${selectedService?.name}`}
        >
          {slots.length === 0 ? (
            <p className="text-zinc-500 text-center py-6">No hay horarios disponibles</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => {
                    setSelectedTime(slot);
                    setStep(3);
                  }}
                  className={`py-3 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                    selectedTime === slot
                      ? "bg-amber-400 text-zinc-900 border-amber-400"
                      : "bg-zinc-800 text-white border-zinc-700 hover:border-amber-400 hover:text-amber-400"
                  }`}
                >
                  {slot} hs
                </button>
              ))}
            </div>
          )}
        </StepCard>
      )}

      {/* Step 3: Datos */}
      {step === 3 && selectedTime && (
        <StepCard
          title="Tus datos"
          back={() => setStep(2)}
          subtitle={`${selectedDate} a las ${selectedTime} hs · ${selectedService?.name}`}
        >
          <div className="space-y-4">
            <div>
              <Label className="text-zinc-300 text-sm">Nombre y apellido</Label>
              <Input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ej: Juan García"
                className="mt-1.5 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-amber-400 focus-visible:border-amber-400"
              />
            </div>
            <div>
              <Label className="text-zinc-300 text-sm">Teléfono</Label>
              <Input
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="Ej: 2241XXXXXX"
                type="tel"
                className="mt-1.5 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-amber-400 focus-visible:border-amber-400"
              />
              <p className="text-xs text-zinc-600 mt-1">
                Usamos tu número para identificarte. Sin spam.
              </p>
            </div>

            {/* Resumen */}
            <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 space-y-2 text-sm mt-2">
              <DetailRow label="Servicio" value={selectedService?.name ?? ""} />
              <DetailRow label="Fecha" value={selectedDate} />
              <DetailRow label="Hora" value={`${selectedTime} hs`} />
              <DetailRow label="Precio" value={`$${selectedService?.price.toLocaleString("es-AR")}`} />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!clientName.trim() || !clientPhone.trim() || submitting}
              className="w-full bg-amber-400 hover:bg-amber-300 text-zinc-900 font-bold py-3 text-base cursor-pointer"
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar reserva
            </Button>
          </div>
        </StepCard>
      )}
    </div>
  );
}

function StepCard({
  title,
  subtitle,
  back,
  children,
}: {
  title: string;
  subtitle?: string;
  back?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      {back && (
        <button
          onClick={back}
          className="flex items-center gap-1 text-zinc-500 hover:text-white text-sm mb-4 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver
        </button>
      )}
      <h2 className="text-xl font-bold text-white mb-1">{title}</h2>
      {subtitle && <p className="text-sm text-amber-400 mb-4">{subtitle}</p>}
      {!subtitle && <div className="mb-4" />}
      {children}
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
