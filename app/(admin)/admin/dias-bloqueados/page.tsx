import { getBlockedDates } from "@/actions/schedule";
import { BlockedDatesManager } from "@/components/admin/blocked-dates-manager";

export default async function DiasBloqueadosPage() {
  const blockedDates = await getBlockedDates();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Días bloqueados</h1>
        <p className="text-gray-500 text-sm mt-1">
          Bloqueá días específicos: feriados, vacaciones, ausencias
        </p>
      </div>
      <BlockedDatesManager
        initialDates={blockedDates.map((d) => ({
          ...d,
          date: d.date.toISOString().split("T")[0],
        }))}
      />
    </div>
  );
}
