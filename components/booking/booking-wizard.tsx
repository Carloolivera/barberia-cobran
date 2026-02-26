"use client";

import { useState } from "react";
import { toast } from "sonner";
import { getAvailableSlots, createAppointment } from "@/actions/booking";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  CheckCircle2,
  Clock,
  ChevronLeft,
  Loader2,
  AlertCircle,
  Scissors,
  Check,
  CalendarIcon,
} from "lucide-react";

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

const STEP_LABELS = ["Servicio", "Fecha", "Horario", "Datos"] as const;
const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTH_NAMES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDateEs(dateStr: string): string {
  const [, m, d] = dateStr.split("-");
  return `${parseInt(d)} de ${MONTH_NAMES[parseInt(m) - 1]}`;
}

// CSS vars to theme the Calendar for the dark/amber UI
const calendarTheme = {
  ["--primary" as string]: "#fbbf24",
  ["--primary-foreground" as string]: "#18181b",
  ["--background" as string]: "#27272a",
  ["--foreground" as string]: "#fafafa",
  ["--accent" as string]: "#3f3f46",
  ["--accent-foreground" as string]: "#fafafa",
  ["--muted-foreground" as string]: "#71717a",
  ["--border" as string]: "#3f3f46",
};

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

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 14);
  maxDate.setHours(23, 59, 59, 999);

  function isDisabledDate(date: Date): boolean {
    if (date < tomorrow || date > maxDate) return true;
    const dayOfWeek = date.getDay();
    const dateStr = toDateStr(date);
    return !activeDays.includes(dayOfWeek) || blockedDates.includes(dateStr);
  }

  async function handleDateSelect(date: string) {
    setSelectedDate(date);
    setSelectedTime("");
    setSlots([]);
    if (!date || !selectedService) return;

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

  function resetWizard() {
    setStep(0);
    setSelectedService(null);
    setSelectedDate("");
    setSelectedTime("");
    setClientName("");
    setClientPhone("");
    setSlots([]);
    setResult(null);
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
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8">
        <div className="text-center mb-6">
          {result.status === "CONFIRMED" ? (
            <>
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">¡Turno confirmado!</h2>
              <p className="text-zinc-400">Te esperamos en la barbería</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-zinc-900" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Solicitud recibida</h2>
              <p className="text-zinc-400 mb-1">
                Tu turno está{" "}
                <span className="text-amber-400 font-semibold">pendiente de confirmación</span>.
              </p>
              <p className="text-zinc-500 text-sm">
                El barbero lo revisará y confirmará a la brevedad.
              </p>
            </>
          )}
        </div>

        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 space-y-2 mb-6 text-sm">
          <DetailRow label="Nombre" value={result.appointment.clientName} />
          <DetailRow label="Servicio" value={result.appointment.serviceName} />
          <DetailRow label="Fecha" value={result.appointment.appointmentDate} />
          <DetailRow label="Hora" value={result.appointment.appointmentTime + " hs"} />
          <DetailRow
            label="Estado"
            value={result.status === "CONFIRMED" ? "✓ Confirmado" : "⏳ Pendiente de aprobación"}
          />
        </div>

        <div className="space-y-3">
          <a
            href="/mi-turno"
            className="block w-full text-center py-3 px-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-white text-sm transition-colors"
          >
            Consultá el estado de tu turno →
          </a>
          <button
            onClick={resetWizard}
            className="block w-full text-center py-2 text-zinc-500 hover:text-zinc-300 text-sm transition-colors cursor-pointer"
          >
            Hacer otra reserva
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Step indicator with labels */}
      <div className="flex items-start justify-center">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className="flex items-start">
            <div className="flex flex-col items-center w-16">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i < step
                    ? "bg-amber-400 text-zinc-900"
                    : i === step
                    ? "bg-amber-400 text-zinc-900 ring-4 ring-amber-400/20"
                    : "bg-zinc-800 text-zinc-500 border border-zinc-700"
                }`}
              >
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span
                className={`text-[11px] mt-1.5 font-medium text-center leading-tight ${
                  i <= step ? "text-amber-400" : "text-zinc-600"
                }`}
              >
                {label}
              </span>
            </div>
            {i < 3 && (
              <div
                className={`w-8 h-0.5 mt-4 flex-shrink-0 ${
                  i < step ? "bg-amber-400" : "bg-zinc-700"
                }`}
              />
            )}
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
                className="w-full flex items-center gap-4 p-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-amber-400 rounded-xl transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-lg bg-zinc-700 group-hover:bg-amber-400/10 border border-zinc-600 group-hover:border-amber-400/50 flex items-center justify-center flex-shrink-0 transition-all">
                  <Scissors className="w-5 h-5 text-zinc-400 group-hover:text-amber-400 transition-colors" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-white group-hover:text-amber-400 transition-colors">
                    {s.name}
                  </p>
                  <p className="text-sm text-zinc-500 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {s.durationMinutes} min
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
          back={() => {
            setStep(0);
            setSelectedDate("");
            setSlots([]);
          }}
          subtitle={`Servicio: ${selectedService.name}`}
        >
          <div className="space-y-4">
            <p className="text-xs text-zinc-500 flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5" />
              Días disponibles:{" "}
              <span className="text-zinc-400">
                {DAY_NAMES.filter((_, i) => activeDays.includes(i)).join(", ")}
              </span>
            </p>

            <div className="flex justify-center rounded-xl overflow-hidden" style={calendarTheme}>
              <Calendar
                mode="single"
                selected={selectedDate ? new Date(selectedDate + "T12:00:00") : undefined}
                onSelect={(date) => {
                  if (date) handleDateSelect(toDateStr(date));
                }}
                disabled={isDisabledDate}
                className="bg-zinc-800 rounded-xl p-2"
              />
            </div>

            {loadingSlots && (
              <div className="flex items-center justify-center gap-2 text-zinc-400 py-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Buscando horarios disponibles...</span>
              </div>
            )}
          </div>
        </StepCard>
      )}

      {/* Step 2: Horario */}
      {step === 2 && selectedDate && (
        <StepCard
          title="¿A qué hora?"
          back={() => {
            setStep(1);
            setSelectedTime("");
          }}
          subtitle={`${formatDateEs(selectedDate)} · ${selectedService?.name}`}
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
          subtitle={`${formatDateEs(selectedDate)} a las ${selectedTime} hs · ${selectedService?.name}`}
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

            <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 space-y-2 text-sm">
              <DetailRow label="Servicio" value={selectedService?.name ?? ""} />
              <DetailRow label="Fecha" value={formatDateEs(selectedDate)} />
              <DetailRow label="Hora" value={`${selectedTime} hs`} />
              <DetailRow
                label="Precio"
                value={`$${selectedService?.price.toLocaleString("es-AR")}`}
              />
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
