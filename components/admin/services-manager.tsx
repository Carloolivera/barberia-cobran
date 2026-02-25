"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { createService, updateService, deleteService } from "@/actions/services";
import { Plus, Pencil, Trash2, Clock, DollarSign } from "lucide-react";

type Service = {
  id: string;
  name: string;
  durationMinutes: number;
  price: unknown;
  active: boolean;
  order: number;
};

export function ServicesManager({ initialServices }: { initialServices: Service[] }) {
  const router = useRouter();
  const [dialog, setDialog] = useState<{
    open: boolean;
    mode: "create" | "edit";
    service?: Service;
  }>({ open: false, mode: "create" });
  const [form, setForm] = useState({ name: "", durationMinutes: 30, price: 0 });
  const [loading, setLoading] = useState(false);

  function openCreate() {
    setForm({ name: "", durationMinutes: 30, price: 0 });
    setDialog({ open: true, mode: "create" });
  }

  function openEdit(service: Service) {
    setForm({
      name: service.name,
      durationMinutes: service.durationMinutes,
      price: Number(service.price),
    });
    setDialog({ open: true, mode: "edit", service });
  }

  async function handleSave() {
    setLoading(true);
    let result;
    if (dialog.mode === "create") {
      result = await createService(form);
    } else if (dialog.service) {
      result = await updateService(dialog.service.id, form);
    }
    setLoading(false);

    if (result?.success) {
      toast.success(dialog.mode === "create" ? "Servicio creado" : "Servicio actualizado");
      setDialog({ open: false, mode: "create" });
      router.refresh();
    }
  }

  async function handleToggleActive(service: Service) {
    await updateService(service.id, { active: !service.active });
    toast.success(service.active ? "Servicio desactivado" : "Servicio activado");
    router.refresh();
  }

  async function handleDelete(id: string) {
    const result = await deleteService(id);
    if (result.success) {
      toast.success("Servicio eliminado");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate} className="bg-zinc-900 hover:bg-zinc-800 cursor-pointer" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo servicio
        </Button>
      </div>

      <div className="bg-white border rounded-xl divide-y overflow-hidden">
        {initialServices.map((service) => (
          <div key={service.id} className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{service.name}</span>
                  {!service.active && (
                    <Badge variant="outline" className="text-xs text-gray-400">inactivo</Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {service.durationMinutes} min
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    ${Number(service.price).toLocaleString("es-AR")}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700 cursor-pointer"
                onClick={() => handleToggleActive(service)}
              >
                {service.active ? "Desactivar" : "Activar"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="cursor-pointer"
                onClick={() => openEdit(service)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                onClick={() => handleDelete(service.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={dialog.open} onOpenChange={(open) => setDialog({ ...dialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialog.mode === "create" ? "Nuevo servicio" : "Editar servicio"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Nombre</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ej: Corte de pelo"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Duración (minutos)</Label>
                <Input
                  type="number"
                  min={10}
                  max={240}
                  step={5}
                  value={form.durationMinutes}
                  onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Precio ($)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog({ ...dialog, open: false })}>Cancelar</Button>
            <Button
              onClick={handleSave}
              disabled={!form.name || loading}
              className="bg-zinc-900 hover:bg-zinc-800 cursor-pointer"
            >
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
