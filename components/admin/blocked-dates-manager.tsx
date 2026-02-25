"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { createBlockedDate, deleteBlockedDate } from "@/actions/schedule";
import { Plus, Trash2, CalendarX } from "lucide-react";

type BlockedDate = { id: string; date: string; reason: string | null };

export function BlockedDatesManager({ initialDates }: { initialDates: BlockedDate[] }) {
  const router = useRouter();
  const [addDialog, setAddDialog] = useState(false);
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    setLoading(true);
    const result = await createBlockedDate({ date, reason });
    setLoading(false);
    if (result.success) {
      toast.success("Día bloqueado");
      setAddDialog(false);
      setDate(""); setReason("");
      router.refresh();
    }
  }

  async function handleDelete(id: string) {
    await deleteBlockedDate(id);
    toast.success("Día desbloqueado");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => setAddDialog(true)}
          className="bg-zinc-900 hover:bg-zinc-800 cursor-pointer"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Bloquear día
        </Button>
      </div>

      {initialDates.length === 0 ? (
        <div className="bg-white border rounded-xl p-12 text-center text-gray-400">
          <CalendarX className="w-12 h-12 mx-auto mb-3 text-gray-200" />
          <p>Sin días bloqueados</p>
        </div>
      ) : (
        <div className="bg-white border rounded-xl divide-y overflow-hidden">
          {initialDates.map((d) => (
            <div key={d.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="font-medium text-gray-900">{d.date}</p>
                {d.reason && <p className="text-sm text-gray-500">{d.reason}</p>}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                onClick={() => handleDelete(d.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bloquear un día</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Fecha</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Motivo (opcional)</Label>
              <Input
                placeholder="Ej: Feriado nacional"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialog(false)}>Cancelar</Button>
            <Button
              onClick={handleAdd}
              disabled={!date || loading}
              className="bg-zinc-900 hover:bg-zinc-800 cursor-pointer"
            >
              Bloquear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
