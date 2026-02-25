import { AppointmentStatusChecker } from "@/components/booking/appointment-status-checker";

export default function MiTurnoPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Mi turno</h1>
        <p className="text-zinc-400">
          Ingresá tu número de teléfono para ver el estado de tu reserva
        </p>
      </div>
      <AppointmentStatusChecker />
    </div>
  );
}
