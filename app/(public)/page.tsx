import { getServices } from "@/actions/services";
import { getActiveDaysOfWeek, getBlockedDatesPublic } from "@/actions/schedule";
import { BookingWizard } from "@/components/booking/booking-wizard";
import { Scissors } from "lucide-react";

export default async function HomePage() {
  const [services, activeDays, blockedDates] = await Promise.all([
    getServices(true),
    getActiveDaysOfWeek(),
    getBlockedDatesPublic(),
  ]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-zinc-800 text-amber-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-4 tracking-wider">
          <Scissors className="w-3 h-3" />
          RESERVA ONLINE
        </div>
        <h1 className="text-4xl font-bold text-white mb-3 leading-tight">
          Reservá tu turno
        </h1>
        <p className="text-zinc-400 text-base">
          Elegí el servicio, la fecha y el horario que más te convenga
        </p>
      </div>

      {/* Wizard */}
      <BookingWizard
        services={services.map((s) => ({
          id: s.id,
          name: s.name,
          durationMinutes: s.durationMinutes,
          price: Number(s.price),
        }))}
        activeDays={activeDays}
        blockedDates={blockedDates}
      />
    </div>
  );
}
