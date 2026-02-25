"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { createKnownClient, deleteKnownClient } from "@/actions/known-clients";
import { UserPlus, Trash2, Phone, Shield } from "lucide-react";

type KnownClient = {
  id: string;
  phone: string;
  name: string | null;
  notes: string | null;
  createdAt: Date;
};

export function KnownClientsManager({ initialClients }: { initialClients: KnownClient[] }) {
  const router = useRouter();
  const [addDialog, setAddDialog] = useState(false);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function handleAdd() {
    setLoading(true);
    const result = await createKnownClient({ phone, name, notes });
    setLoading(false);

    if (result.success) {
      toast.success("Cliente agregado a la lista");
      setAddDialog(false);
      setPhone(""); setName(""); setNotes("");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleDelete(id: string) {
    const result = await deleteKnownClient(id);
    if (result.success) {
      toast.success("Cliente eliminado de la lista");
      setDeleteId(null);
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Shield className="w-4 h-4 text-blue-500" />
          {initialClients.length} número{initialClients.length !== 1 ? "s" : ""} en la lista
        </div>
        <Button
          onClick={() => setAddDialog(true)}
          className="bg-zinc-900 hover:bg-zinc-800 cursor-pointer"
          size="sm"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Agregar número
        </Button>
      </div>

      {initialClients.length === 0 ? (
        <div className="bg-white border rounded-xl p-12 text-center text-gray-400">
          <Shield className="w-12 h-12 mx-auto mb-3 text-gray-200" />
          <p className="font-medium">La lista está vacía</p>
          <p className="text-sm mt-1">Agregá los teléfonos de tus clientes de confianza</p>
        </div>
      ) : (
        <div className="bg-white border rounded-xl divide-y overflow-hidden">
          {initialClients.map((client) => (
            <div key={client.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
                  <Phone className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{client.phone}</span>
                    {client.name && (
                      <Badge variant="outline" className="text-xs text-gray-500">
                        {client.name}
                      </Badge>
                    )}
                  </div>
                  {client.notes && (
                    <p className="text-xs text-gray-400 mt-0.5">{client.notes}</p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                onClick={() => setDeleteId(client.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar cliente conocido</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Teléfono *</Label>
              <Input
                placeholder="Ej: 2241xxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Nombre (opcional)</Label>
              <Input
                placeholder="Ej: Juan Pérez"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Notas (opcional)</Label>
              <Input
                placeholder="Ej: corte estilo 2"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialog(false)}>Cancelar</Button>
            <Button
              onClick={handleAdd}
              disabled={!phone || loading}
              className="bg-zinc-900 hover:bg-zinc-800 cursor-pointer"
            >
              Agregar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar de la lista?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Este número ya no recibirá confirmación automática. Sus próximas reservas quedarán pendientes.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancelar</Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && handleDelete(deleteId)}
              className="cursor-pointer"
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
