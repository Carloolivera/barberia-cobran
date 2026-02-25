import { Badge } from "@/components/ui/badge";

const statusConfig = {
  PENDING: { label: "Pendiente", className: "bg-orange-100 text-orange-700 border-orange-200" },
  CONFIRMED: { label: "Confirmado", className: "bg-green-100 text-green-700 border-green-200" },
  REJECTED: { label: "Rechazado", className: "bg-red-100 text-red-700 border-red-200" },
  CANCELLED: { label: "Cancelado", className: "bg-gray-100 text-gray-600 border-gray-200" },
  COMPLETED: { label: "Completado", className: "bg-blue-100 text-blue-700 border-blue-200" },
} as const;

export function AppointmentStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as keyof typeof statusConfig] ?? {
    label: status,
    className: "bg-gray-100 text-gray-600",
  };

  return (
    <Badge variant="outline" className={`text-xs font-medium ${config.className}`}>
      {config.label}
    </Badge>
  );
}
