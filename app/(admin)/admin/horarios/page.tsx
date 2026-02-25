import { getWorkingHours } from "@/actions/schedule";
import { ScheduleManager } from "@/components/admin/schedule-manager";

export default async function HorariosPage() {
  const workingHours = await getWorkingHours();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Horarios de atención</h1>
        <p className="text-gray-500 text-sm mt-1">
          Configurá qué días y horarios aceptás turnos
        </p>
      </div>
      <ScheduleManager initialHours={workingHours} />
    </div>
  );
}
