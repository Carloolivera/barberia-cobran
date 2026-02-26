import { getAppointments } from "@/actions/appointments";
import { AppointmentsTable } from "@/components/admin/appointments-table";

type Props = {
  searchParams: Promise<{ status?: string; date?: string }>;
};

export default async function TurnosPage({ searchParams }: Props) {
  const { status, date } = await searchParams;
  const appointments = await getAppointments({ status, date });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Turnos</h1>
        <p className="text-gray-500 text-sm mt-1">Gestioná todas las reservas</p>
      </div>
      <AppointmentsTable appointments={appointments} currentStatus={status} currentDate={date} />
    </div>
  );
}
