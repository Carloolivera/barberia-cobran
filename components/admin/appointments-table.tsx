"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AppointmentStatusBadge } from "./appointment-status-badge";
import { approveAppointment, rejectAppointment, completeAppointment } from "@/actions/appointments";
import { CheckCircle2, XCircle, CheckSquare, Users } from "lucide-react";
import Link from "next/link";

type Appointment = {
  id: string;
  clientName: string;
  clientPhone: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  isKnownClient: boolean;
  notes: string | null;
};

const STATUS_FILTERS = [
  { value: "all", label: "Todos" },
  { value: "PENDING", label: "Pendientes" },
  { value: "CONFIRMED", label: "Confirmados" },
  { value: "COMPLETED", label: "Completados" },
  { value: "REJECTED", label: "Rechazados" },
  { value: "CANCELLED", label: "Cancelados" },
];

export function AppointmentsTable({
  appointments,
  currentStatus,
}: {
  appointments: Appointment[];
  currentStatus?: string;
}) {
  const router = useRouter();
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    appointmentId: string;
    clientName: string;
  }>({ open: false, appointmentId: "", clientName: "" });
  const [rejectReason, setRejectReason] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  async function handleApprove(id: string) {
    setLoading(id + "-approve");
    const result = await approveAppointment(id);
    setLoading(null);
    if (result.success) {
      toast.success("Turno confirmado");
      router.refresh();
    }
  }

  async function handleReject() {
    setLoading(rejectDialog.appointmentId + "-reject");
    const result = await rejectAppointment(rejectDialog.appointmentId, rejectReason);
    setLoading(null);
    if (result.success) {
      toast.success("Turno rechazado");
      setRejectDialog({ open: false, appointmentId: "", clientName: "" });
      setRejectReason("");
      router.refresh();
    }
  }

  async function handleComplete(id: string) {
    setLoading(id + "-complete");
    const result = await completeAppointment(id);
    setLoading(null);
    if (result.success) {
      toast.success("Turno marcado como completado");
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      {/* Filtros de status */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value === "all" ? "/admin/turnos" : `/admin/turnos?status=${f.value}`}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              (currentStatus ?? "all") === f.value
                ? "bg-zinc-900 text-white"
                : "bg-white text-gray-600 border hover:bg-gray-50"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {/* Tabla */}
      <div className="bg-white border rounded-xl overflow-hidden">
        {appointments.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <CalendarEmpty />
            <p className="mt-2">Sin turnos para mostrar</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Fecha / Hora</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Servicio</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((appt) => (
                <TableRow key={appt.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="font-medium">{appt.appointmentDate}</div>
                    <div className="text-sm text-gray-500">{appt.appointmentTime} hs</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium flex items-center gap-1.5">
                      {appt.clientName}
                      {appt.isKnownClient && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200">
                          conocido
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">{appt.clientPhone}</div>
                  </TableCell>
                  <TableCell className="text-sm">{appt.serviceName}</TableCell>
                  <TableCell>
                    <AppointmentStatusBadge status={appt.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {appt.status === "PENDING" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-200 hover:bg-green-50 cursor-pointer"
                            disabled={loading === appt.id + "-approve"}
                            onClick={() => handleApprove(appt.id)}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Confirmar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50 cursor-pointer"
                            onClick={() =>
                              setRejectDialog({
                                open: true,
                                appointmentId: appt.id,
                                clientName: appt.clientName,
                              })
                            }
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Rechazar
                          </Button>
                        </>
                      )}
                      {appt.status === "CONFIRMED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-blue-600 border-blue-200 hover:bg-blue-50 cursor-pointer"
                          disabled={loading === appt.id + "-complete"}
                          onClick={() => handleComplete(appt.id)}
                        >
                          <CheckSquare className="w-4 h-4 mr-1" />
                          Completar
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Dialog rechazar */}
      <Dialog
        open={rejectDialog.open}
        onOpenChange={(open) =>
          setRejectDialog({ open, appointmentId: "", clientName: "" })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar turno de {rejectDialog.clientName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo (opcional)</Label>
            <Textarea
              id="reason"
              placeholder="Ej: No hay lugar disponible ese día"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialog({ open: false, appointmentId: "", clientName: "" })}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!!loading}
              className="cursor-pointer"
            >
              Rechazar turno
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CalendarEmpty() {
  return (
    <svg className="w-12 h-12 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
