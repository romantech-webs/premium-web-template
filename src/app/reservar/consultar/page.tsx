"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, Loader2, Calendar, Clock, User, Phone, CheckCircle, XCircle, ArrowLeft, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useClinic } from "@/config/clinic-context"
import { lookupAppointment, cancelAppointment, type AppointmentDetail } from "@/lib/booking-api"

// ─── Helpers ────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  completed: "Completada",
  cancelled: "Cancelada",
  no_show: "No show",
}

const STATUS_COLORS: Record<string, string> = {
  pending: "#EAB308",
  confirmed: "#3B82F6",
  completed: "#22C55E",
  cancelled: "#EF4444",
  no_show: "#9CA3AF",
}

function formatDate(iso: string): string {
  const date = new Date(iso)
  const formatted = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
  // Capitalize first letter
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

// ─── Component ──────────────────────────────────────────────────────

type ViewState =
  | { step: "search" }
  | { step: "loading" }
  | { step: "found"; appointment: AppointmentDetail }
  | { step: "confirm-cancel"; appointment: AppointmentDetail }
  | { step: "cancelling"; appointment: AppointmentDetail }
  | { step: "cancelled"; appointment: AppointmentDetail }
  | { step: "error"; message: string }

export default function ConsultarCitaPage() {
  const clinic = useClinic()
  void clinic // page uses clinic context indirectly (theme colors)

  const [code, setCode] = useState("")
  const [view, setView] = useState<ViewState>({ step: "search" })
  const [cancelReason, setCancelReason] = useState("")

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = code.trim()
    if (!trimmed) return

    setView({ step: "loading" })
    try {
      const appointment = await lookupAppointment(trimmed)
      setView({ step: "found", appointment })
    } catch {
      setView({ step: "error", message: "Cita no encontrada" })
    }
  }

  async function handleCancel(appointment: AppointmentDetail) {
    setView({ step: "cancelling", appointment })
    try {
      await cancelAppointment(appointment.id, cancelReason || undefined)
      setView({
        step: "cancelled",
        appointment: { ...appointment, status: "cancelled" },
      })
    } catch {
      // Go back to found view on error
      setView({ step: "found", appointment })
    }
  }

  function handleReset() {
    setCode("")
    setCancelReason("")
    setView({ step: "search" })
  }

  return (
    <div className="pt-24 min-h-screen bg-neutral">
      <section className="section-padding">
        <div className="container-narrow">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-secondary mb-3">
              Consultar tu cita
            </h1>
            <p className="text-secondary/60">
              Introduce tu código de confirmación para ver los detalles de tu cita
            </p>
          </motion.div>

          {/* Search form */}
          {(view.step === "search" || view.step === "loading" || view.step === "error") && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-gray-100 p-8"
            >
              <form onSubmit={handleSearch} className="space-y-6">
                <div>
                  <label
                    htmlFor="code"
                    className="block text-sm font-medium text-secondary mb-2"
                  >
                    Código de confirmación
                  </label>
                  <input
                    type="text"
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Ej: ABC123"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-center text-lg tracking-widest uppercase"
                    disabled={view.step === "loading"}
                    autoFocus
                  />
                </div>

                {view.step === "error" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 rounded-xl bg-red-50 text-red-700"
                  >
                    <XCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{view.message}</p>
                  </motion.div>
                )}

                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={view.step === "loading" || !code.trim()}
                >
                  {view.step === "loading" ? (
                    <Loader2 className="w-5 h-5 animate-spin relative z-10" />
                  ) : (
                    <Search className="w-5 h-5 relative z-10" />
                  )}
                  <span className="relative z-10">
                    {view.step === "loading" ? "Buscando..." : "Buscar"}
                  </span>
                </button>
              </form>
            </motion.div>
          )}

          {/* Appointment found */}
          {(view.step === "found" || view.step === "confirm-cancel" || view.step === "cancelling") && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl border border-gray-100 p-8">
                {/* Status badge + service */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-display font-bold text-secondary">
                      {view.appointment.service?.name ?? "Cita"}
                    </h2>
                    {view.appointment.employee && (
                      <p className="text-secondary/60 mt-1">
                        con {view.appointment.employee.name}
                        {view.appointment.employee.role && (
                          <span className="text-secondary/40"> &middot; {view.appointment.employee.role}</span>
                        )}
                      </p>
                    )}
                  </div>
                  <span
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${STATUS_COLORS[view.appointment.status] ?? "#9CA3AF"}1A`,
                      color: STATUS_COLORS[view.appointment.status] ?? "#9CA3AF",
                    }}
                  >
                    {STATUS_LABELS[view.appointment.status] ?? view.appointment.status}
                  </span>
                </div>

                {/* Details grid */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral">
                    <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-xs text-secondary/50">Fecha y hora</p>
                      <p className="text-sm font-medium text-secondary">
                        {formatDate(view.appointment.scheduledAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral">
                    <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-xs text-secondary/50">Duración</p>
                      <p className="text-sm font-medium text-secondary">
                        {view.appointment.durationMin} minutos
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral">
                    <User className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-xs text-secondary/50">Paciente</p>
                      <p className="text-sm font-medium text-secondary">
                        {view.appointment.customer.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral">
                    <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-xs text-secondary/50">Teléfono</p>
                      <p className="text-sm font-medium text-secondary">
                        {view.appointment.customer.phone}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Price if available */}
                {view.appointment.service?.price && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-sm text-secondary/60">Precio</span>
                    <span className="text-lg font-semibold text-secondary">
                      {view.appointment.service.price}
                    </span>
                  </div>
                )}

                {/* Cancel button (only for pending/confirmed) */}
                {(view.appointment.status === "pending" || view.appointment.status === "confirmed") &&
                  view.step === "found" && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <button
                        onClick={() =>
                          setView({ step: "confirm-cancel", appointment: view.appointment })
                        }
                        className="w-full sm:w-auto px-6 py-3 rounded-xl border-2 border-red-300 text-red-600 font-medium hover:bg-red-50 transition-colors"
                      >
                        Cancelar cita
                      </button>
                    </div>
                  )}
              </div>

              {/* Cancel confirmation modal */}
              {(view.step === "confirm-cancel" || view.step === "cancelling") && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-red-100 p-8"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <h3 className="text-lg font-display font-bold text-secondary">
                      ¿Seguro que quieres cancelar?
                    </h3>
                  </div>

                  <p className="text-sm text-secondary/60 mb-4">
                    Esta acción no se puede deshacer. Tu cita será cancelada y el horario quedará
                    disponible para otros pacientes.
                  </p>

                  <div className="mb-6">
                    <label
                      htmlFor="cancel-reason"
                      className="block text-sm font-medium text-secondary mb-2"
                    >
                      Motivo de cancelación (opcional)
                    </label>
                    <textarea
                      id="cancel-reason"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                      placeholder="Ej: No puedo asistir por motivos personales"
                      disabled={view.step === "cancelling"}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => handleCancel(view.appointment)}
                      disabled={view.step === "cancelling"}
                      className="px-6 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {view.step === "cancelling" ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Cancelando...
                        </>
                      ) : (
                        "Cancelar cita"
                      )}
                    </button>
                    <button
                      onClick={() =>
                        setView({ step: "found", appointment: view.appointment })
                      }
                      disabled={view.step === "cancelling"}
                      className="px-6 py-3 rounded-xl bg-gray-100 text-secondary font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      Volver
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Back to search */}
              <button
                onClick={handleReset}
                className="flex items-center gap-2 text-sm text-secondary/50 hover:text-secondary transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Buscar otra cita
              </button>
            </motion.div>
          )}

          {/* Cancelled success */}
          {view.step === "cancelled" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 p-8 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-display font-bold text-secondary mb-2">
                Cita cancelada
              </h2>
              <p className="text-secondary/60 mb-2">
                Tu cita ha sido cancelada correctamente.
              </p>
              <p className="text-sm text-secondary/40 mb-6">
                {view.appointment.service?.name && (
                  <span>{view.appointment.service.name} &middot; </span>
                )}
                {formatDate(view.appointment.scheduledAt)}
              </p>

              {/* Updated status badge */}
              <span
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mb-8"
                style={{
                  backgroundColor: `${STATUS_COLORS.cancelled}1A`,
                  color: STATUS_COLORS.cancelled,
                }}
              >
                {STATUS_LABELS.cancelled}
              </span>

              <div className="flex flex-col items-center gap-3">
                <button onClick={handleReset} className="btn-secondary">
                  <span className="relative z-10">Consultar otra cita</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* Footer link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center mt-8"
          >
            <Link
              href="/reservar"
              className="text-sm text-primary hover:underline font-medium"
            >
              Hacer una nueva reserva
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
