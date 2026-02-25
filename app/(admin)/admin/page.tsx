import { getDashboardStats, getAppointments } from "@/actions/appointments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { AppointmentStatusBadge } from "@/components/admin/appointment-status-badge";

export default async function AdminDashboard() {
  const [stats, pendingAppts, todayAppts] = await Promise.all([
    getDashboardStats(),
    getAppointments({ status: "PENDING" }),
    getAppointments({ date: new Date().toISOString().split("T")[0] }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString("es-AR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={stats.pending > 0 ? "border-orange-300 bg-orange-50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Solicitudes pendientes
            </CardTitle>
            <AlertCircle className={`w-5 h-5 ${stats.pending > 0 ? "text-orange-500" : "text-gray-400"}`} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.pending}</div>
            {stats.pending > 0 && (
              <Link href="/admin/turnos?status=PENDING" className="text-xs text-orange-600 hover:underline">
                Ver pendientes →
              </Link>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Confirmados hoy
            </CardTitle>
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.todayConfirmed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Turnos este mes
            </CardTitle>
            <CalendarDays className="w-5 h-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalThisMonth}</div>
          </CardContent>
        </Card>
      </div>

      {/* Pendientes */}
      {pendingAppts.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-orange-500" />
            Requieren tu decisión ({pendingAppts.length})
          </h2>
          <div className="space-y-2">
            {pendingAppts.slice(0, 5).map((appt) => (
              <div
                key={appt.id}
                className="flex items-center justify-between bg-white border border-orange-200 rounded-xl px-4 py-3"
              >
                <div>
                  <p className="font-medium text-gray-900">{appt.clientName}</p>
                  <p className="text-sm text-gray-500">
                    {appt.serviceName} · {appt.appointmentDate} a las {appt.appointmentTime}
                  </p>
                  <p className="text-xs text-gray-400">{appt.clientPhone}</p>
                </div>
                <Link
                  href="/admin/turnos?status=PENDING"
                  className="text-sm text-orange-600 hover:underline font-medium"
                >
                  Gestionar →
                </Link>
              </div>
            ))}
            {pendingAppts.length > 5 && (
              <Link href="/admin/turnos?status=PENDING" className="text-sm text-orange-600 hover:underline">
                Ver {pendingAppts.length - 5} más →
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Hoy */}
      <div>
        <h2 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-500" />
          Turnos de hoy ({todayAppts.filter((a) => a.status === "CONFIRMED").length} confirmados)
        </h2>
        {todayAppts.length === 0 ? (
          <p className="text-gray-400 text-sm">Sin turnos para hoy</p>
        ) : (
          <div className="space-y-2">
            {todayAppts
              .filter((a) => ["CONFIRMED", "PENDING"].includes(a.status))
              .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime))
              .map((appt) => (
                <div
                  key={appt.id}
                  className="flex items-center justify-between bg-white border rounded-xl px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-700 w-12">
                      {appt.appointmentTime}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{appt.clientName}</p>
                      <p className="text-sm text-gray-500">{appt.serviceName}</p>
                    </div>
                  </div>
                  <AppointmentStatusBadge status={appt.status} />
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
