"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { upsertWorkingHour } from "@/actions/schedule";

const DAYS = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
  { value: 0, label: "Domingo" },
];

type WorkingHour = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  active: boolean;
};

export function ScheduleManager({ initialHours }: { initialHours: WorkingHour[] }) {
  const router = useRouter();
  const [hours, setHours] = useState<Record<number, { startTime: string; endTime: string; active: boolean }>>(() => {
    const map: Record<number, { startTime: string; endTime: string; active: boolean }> = {};
    for (const day of DAYS) {
      const h = initialHours.find((ih) => ih.dayOfWeek === day.value);
      map[day.value] = {
        startTime: h?.startTime ?? "09:00",
        endTime: h?.endTime ?? "18:00",
        active: h?.active ?? false,
      };
    }
    return map;
  });
  const [saving, setSaving] = useState<number | null>(null);

  async function handleSave(dayOfWeek: number) {
    setSaving(dayOfWeek);
    const { startTime, endTime, active } = hours[dayOfWeek];
    const result = await upsertWorkingHour({ dayOfWeek, startTime, endTime, active });
    setSaving(null);
    if (result.success) {
      toast.success("Horario guardado");
      router.refresh();
    }
  }

  return (
    <div className="bg-white border rounded-xl divide-y overflow-hidden">
      {DAYS.map((day) => {
        const h = hours[day.value];
        return (
          <div key={day.value} className="flex items-center gap-4 px-5 py-4">
            {/* Toggle activo */}
            <button
              onClick={() =>
                setHours((prev) => ({
                  ...prev,
                  [day.value]: { ...prev[day.value], active: !prev[day.value].active },
                }))
              }
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                h.active ? "bg-green-500" : "bg-gray-200"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  h.active ? "translate-x-5" : ""
                }`}
              />
            </button>

            {/* Día */}
            <span className={`w-24 font-medium text-sm ${h.active ? "text-gray-900" : "text-gray-400"}`}>
              {day.label}
            </span>

            {/* Horarios */}
            <div className={`flex items-center gap-2 text-sm ${!h.active && "opacity-40 pointer-events-none"}`}>
              <Input
                type="time"
                value={h.startTime}
                onChange={(e) =>
                  setHours((prev) => ({
                    ...prev,
                    [day.value]: { ...prev[day.value], startTime: e.target.value },
                  }))
                }
                className="w-32 h-8 text-sm"
              />
              <span className="text-gray-400">—</span>
              <Input
                type="time"
                value={h.endTime}
                onChange={(e) =>
                  setHours((prev) => ({
                    ...prev,
                    [day.value]: { ...prev[day.value], endTime: e.target.value },
                  }))
                }
                className="w-32 h-8 text-sm"
              />
            </div>

            <Button
              size="sm"
              variant="outline"
              disabled={saving === day.value}
              onClick={() => handleSave(day.value)}
              className="ml-auto cursor-pointer"
            >
              Guardar
            </Button>
          </div>
        );
      })}
    </div>
  );
}
