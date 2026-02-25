"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  CalendarDays,
  List,
  Briefcase,
  Clock,
  Settings,
  Loader2,
  Phone,
  User,
  Users,
  AlertTriangle,
  Plus,
  Trash2,
  Pencil,
  Download,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Check,
  X,
  Shield,
  RefreshCw,
  BarChart3,
  ContactRound,
  Search,
  Mail,
  ArrowLeft,
  Hash,
  ExternalLink,
  Sun,
  Moon,
  Smartphone,
  MessageCircle,
  MoreHorizontal,
  LogOut,
} from "lucide-react"
import { useClinic } from "@/config/clinic-context"
import {
  validateOwnerToken,
  fetchAppointments,
  updateAppointmentStatus,
  fetchOwnerConfig,
  updateOwnerConfig,
  fetchOwnerEmployees,
  fetchOwnerServices,
  manageService,
  manageEmployee,
  fetchSchedules,
  manageSchedule,
  fetchExceptions,
  manageException,
  manualCreateBooking,
  rescheduleAppointment,
  fetchAvailability,
  fetchConversations,
  fetchMessages,
} from "@/lib/booking-api"
import type {
  ManagedAppointment,
  BookingService,
  BookingEmployee,
  TimeSlot,
  Conversation,
  WhatsAppMessage,
} from "@/lib/booking-api"

// ─── Constants ───────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: "Pendiente",  color: "#EAB308", bg: "#EAB30815" },
  confirmed: { label: "Confirmada", color: "#3B82F6", bg: "#3B82F615" },
  completed: { label: "Completada", color: "#22C55E", bg: "#22C55E15" },
  cancelled: { label: "Cancelada",  color: "#EF4444", bg: "#EF444415" },
  no_show:   { label: "No show",    color: "#9CA3AF", bg: "#9CA3AF15" },
}

const DAY_NAMES = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

// ─── Design System ───────────────────────────────────────────────────

const CARD = "bg-white dark:bg-gray-900 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04),0_6px_16px_rgba(0,0,0,0.04)] border border-black/[0.04] dark:border-white/[0.06] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)]"
const BTN_PRIMARY = "inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl bg-primary hover:brightness-110 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
const BTN_SECONDARY = "inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
const INPUT = "w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"

type TabId = "hoy" | "calendario" | "citas" | "clientes" | "servicios" | "equipo" | "metricas" | "horarios" | "config" | "mensajes"

interface NavItem {
  id: TabId
  label: string
  icon: typeof CalendarDays
}

const NAV_ITEMS: NavItem[] = [
  { id: "hoy",        label: "Hoy",        icon: CalendarDays },
  { id: "calendario", label: "Calendario", icon: Calendar },
  { id: "citas",      label: "Citas",      icon: List },
  { id: "clientes",   label: "Clientes",   icon: ContactRound },
  { id: "servicios",  label: "Servicios",  icon: Briefcase },
  { id: "equipo",     label: "Equipo",     icon: Users },
  { id: "metricas",   label: "Métricas",   icon: BarChart3 },
  { id: "horarios",   label: "Horarios",   icon: Clock },
  { id: "config",     label: "Config",     icon: Settings },
  { id: "mensajes",   label: "Mensajes",   icon: MessageCircle },
]

const PRIMARY_TABS: TabId[] = ["hoy", "calendario", "citas", "clientes"]
const SECONDARY_TABS: TabId[] = ["servicios", "equipo", "metricas", "horarios", "config", "mensajes"]

// ─── Dark Mode Hook ─────────────────────────────────────────────────

function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    const stored = localStorage.getItem("admin-theme") as "light" | "dark" | null
    const initial = stored || "light"
    setTheme(initial)
    document.documentElement.classList.toggle("dark", initial === "dark")
  }, [])

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light"
      localStorage.setItem("admin-theme", next)
      document.documentElement.classList.toggle("dark", next === "dark")
      return next
    })
  }, [])

  return { theme, toggle }
}

// ─── PWA Head Tags ──────────────────────────────────────────────────

function usePWA() {
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Add manifest + meta tags
    const link = document.createElement("link")
    link.rel = "manifest"
    link.href = "/admin-manifest.json"
    document.head.appendChild(link)

    const meta1 = document.createElement("meta")
    meta1.name = "theme-color"
    meta1.content = "#2563EB"
    document.head.appendChild(meta1)

    const meta2 = document.createElement("meta")
    meta2.name = "apple-mobile-web-app-capable"
    meta2.content = "yes"
    document.head.appendChild(meta2)

    const meta3 = document.createElement("meta")
    meta3.name = "apple-mobile-web-app-status-bar-style"
    meta3.content = "default"
    document.head.appendChild(meta3)

    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/admin-sw.js").catch(() => {})
    }

    // Check if dismissed previously
    if (localStorage.getItem("pwa-install-dismissed") === "1") {
      setDismissed(true)
    }

    return () => {
      document.head.removeChild(link)
      document.head.removeChild(meta1)
      document.head.removeChild(meta2)
      document.head.removeChild(meta3)
    }
  }, [])

  useEffect(() => {
    function handler(e: Event) {
      e.preventDefault()
      setInstallPrompt(e)
    }
    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  async function install() {
    if (!installPrompt) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prompt = installPrompt as any
    prompt.prompt()
    await prompt.userChoice
    setInstallPrompt(null)
  }

  function dismiss() {
    setDismissed(true)
    localStorage.setItem("pwa-install-dismissed", "1")
  }

  return { canInstall: !!installPrompt && !dismissed, install, dismiss }
}

// ─── Helpers ─────────────────────────────────────────────────────────

function toDateISO(d: Date): string {
  return d.toISOString().split("T")[0]
}

function formatDateSpanish(d: Date): string {
  return d.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function formatShortDate(iso: string): string {
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const hours = String(d.getHours()).padStart(2, "0")
  const mins = String(d.getMinutes()).padStart(2, "0")
  return `${day}/${month} ${hours}:${mins}`
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

/**
 * Builds a Google Calendar "Add to Calendar" URL for an appointment.
 */
function getGCalUrl(appt: ManagedAppointment, clinicName?: string): string {
  const start = new Date(appt.scheduledAt)
  const end = new Date(start.getTime() + appt.durationMin * 60_000)

  // Format as YYYYMMDDTHHmmssZ
  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")

  const title = [appt.serviceName, clinicName].filter(Boolean).join(" - ")
  const details = [
    `Profesional: ${appt.employeeName || "-"}`,
    `Cliente: ${appt.customerName}`,
    `Codigo: ${appt.confirmationCode}`,
  ].join("\n")

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${fmt(start)}/${fmt(end)}`,
    details,
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/**
 * Small icon-link that opens a Google Calendar "Add to Calendar" URL.
 * Shows only for pending/confirmed appointments.
 */
function GCalLink({ appt, clinicName }: { appt: ManagedAppointment; clinicName?: string }) {
  if (appt.status === "cancelled" || appt.status === "no_show") return null
  return (
    <a
      href={getGCalUrl(appt, clinicName)}
      target="_blank"
      rel="noopener noreferrer"
      title="Añadir a Google Calendar"
      className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors"
    >
      <ExternalLink className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">GCal</span>
    </a>
  )
}

// ─── Status Badge ────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const info = STATUS_MAP[status] || { label: status, color: "#6B7280", bg: "#6B728015" }
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ color: info.color, backgroundColor: info.bg }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: info.color }} />
      {info.label}
    </span>
  )
}

// ─── Reschedule Modal ────────────────────────────────────────────────

function RescheduleModal({
  appt,
  token,
  onClose,
  onSuccess,
}: {
  appt: ManagedAppointment
  token: string
  onClose: () => void
  onSuccess: () => void
}) {
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Load available slots when date changes
  useEffect(() => {
    if (!date) {
      setSlots([])
      setTime("")
      return
    }
    setLoadingSlots(true)
    setTime("")
    setError("")
    fetchAvailability(date, appt.serviceId, appt.employeeId)
      .then((res) => {
        const empSlots = res.slots[appt.employeeId] || []
        setSlots(empSlots)
      })
      .catch(() => {
        setSlots([])
        setError("Error al cargar horarios")
      })
      .finally(() => setLoadingSlots(false))
  }, [date, appt.serviceId, appt.employeeId])

  async function handleSubmit() {
    if (!date || !time) return
    setSubmitting(true)
    setError("")
    try {
      await rescheduleAppointment(token, appt.id, { date, time })
      setSuccess(true)
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al reagendar")
    } finally {
      setSubmitting(false)
    }
  }

  const availableSlots = slots.filter((s) => s.available)
  const todayISO = toDateISO(new Date())

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.04] dark:border-white/[0.06]">
          <div>
            <h3 className="text-lg font-bold text-secondary dark:text-gray-100 font-display">Reagendar cita</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {appt.customerName} &mdash; {appt.serviceName || "Sin servicio"}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {success ? (
            <div className="flex flex-col items-center py-6">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-3">
                <Check className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-green-700 font-semibold">Cita reagendada</p>
            </div>
          ) : (
            <>
              {/* Date picker */}
              <div>
                <label className="block text-sm font-medium text-secondary dark:text-gray-200 mb-1.5">Nueva fecha</label>
                <input
                  type="date"
                  value={date}
                  min={todayISO}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
                />
              </div>

              {/* Time slots */}
              {date && (
                <div>
                  <label className="block text-sm font-medium text-secondary dark:text-gray-200 mb-1.5">Nueva hora</label>
                  {loadingSlots ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <p className="text-sm text-gray-400 py-3">No hay horarios disponibles para esta fecha</p>
                  ) : (
                    <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot.time}
                          onClick={() => setTime(slot.time)}
                          className={`px-2 py-1.5 text-sm rounded-lg border transition-colors ${
                            time === slot.time
                              ? "border-primary bg-primary/10 text-primary font-semibold"
                              : "border-gray-200 text-gray-700 hover:border-primary/50 hover:bg-primary/5"
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!date || !time || submitting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:brightness-110 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting && <Loader2 className="w-3 h-3 animate-spin" />}
              <span className="relative z-10">Reagendar</span>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

// ─── Action Buttons ──────────────────────────────────────────────────

function AppointmentActions({
  appt,
  token,
  onUpdate,
}: {
  appt: ManagedAppointment
  token: string
  onUpdate: () => void
}) {
  const [loading, setLoading] = useState<string | null>(null)
  const [showReschedule, setShowReschedule] = useState(false)

  async function handleAction(newStatus: string) {
    setLoading(newStatus)
    try {
      await updateAppointmentStatus(token, appt.id, newStatus)
      onUpdate()
    } catch {
      // silently fail — the UI will stay in the previous state
    } finally {
      setLoading(null)
    }
  }

  const spinner = (s: string) => loading === s && <Loader2 className="w-3 h-3 animate-spin" />

  const rescheduleBtn = (
    <button
      onClick={() => setShowReschedule(true)}
      disabled={!!loading}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-amber-600 text-xs font-medium hover:text-amber-800 transition-colors disabled:opacity-50"
    >
      <RefreshCw className="w-3 h-3" /> Reagendar
    </button>
  )

  const rescheduleModal = showReschedule && (
    <AnimatePresence>
      <RescheduleModal
        appt={appt}
        token={token}
        onClose={() => setShowReschedule(false)}
        onSuccess={onUpdate}
      />
    </AnimatePresence>
  )

  if (appt.status === "pending") {
    return (
      <>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleAction("confirmed")}
            disabled={!!loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {spinner("confirmed")} Confirmar
          </button>
          {rescheduleBtn}
          <button
            onClick={() => handleAction("cancelled")}
            disabled={!!loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-red-500 text-xs font-medium hover:text-red-700 transition-colors disabled:opacity-50"
          >
            {spinner("cancelled")} Cancelar
          </button>
        </div>
        {rescheduleModal}
      </>
    )
  }

  if (appt.status === "confirmed") {
    return (
      <>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleAction("completed")}
            disabled={!!loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            {spinner("completed")} Completar
          </button>
          <button
            onClick={() => handleAction("no_show")}
            disabled={!!loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-400 text-white text-xs font-medium rounded-lg hover:bg-gray-500 transition-colors disabled:opacity-50"
          >
            {spinner("no_show")} No show
          </button>
          {rescheduleBtn}
          <button
            onClick={() => handleAction("cancelled")}
            disabled={!!loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-red-500 text-xs font-medium hover:text-red-700 transition-colors disabled:opacity-50"
          >
            {spinner("cancelled")} Cancelar
          </button>
        </div>
        {rescheduleModal}
      </>
    )
  }

  return null
}

// ─── Tab: Hoy ────────────────────────────────────────────────────────

function TabHoy({ token }: { token: string }) {
  const clinic = useClinic()
  const [appointments, setAppointments] = useState<ManagedAppointment[]>([])
  const [loading, setLoading] = useState(true)

  const today = useMemo(() => new Date(), [])
  const todayISO = toDateISO(today)
  const tomorrow = useMemo(() => {
    const d = new Date(today)
    d.setDate(d.getDate() + 1)
    return toDateISO(d)
  }, [today])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchAppointments(token, { from: todayISO, to: tomorrow })
      setAppointments(res.appointments.sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)))
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [token, todayISO, tomorrow])

  useEffect(() => { load() }, [load])

  const stats = useMemo(() => {
    const total = appointments.length
    const pending = appointments.filter(a => a.status === "pending").length
    const confirmed = appointments.filter(a => a.status === "confirmed").length
    return { total, pending, confirmed }
  }, [appointments])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-secondary dark:text-gray-100 font-display capitalize">
          Hoy &mdash; {formatDateSpanish(today)}
        </h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className={`${CARD} p-4 sm:p-5 relative overflow-hidden`}>
          <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-primary/5" />
          <div className="flex sm:flex-col items-center sm:items-center gap-3 sm:gap-0 sm:text-center relative">
            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center sm:hidden flex-shrink-0">
              <CalendarDays className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-secondary dark:text-gray-100">{stats.total}</p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 sm:mt-1">citas hoy</p>
            </div>
          </div>
        </div>
        <div className={`${CARD} p-4 sm:p-5 relative overflow-hidden`}>
          <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-yellow-500/5" />
          <div className="flex sm:flex-col items-center sm:items-center gap-3 sm:gap-0 sm:text-center relative">
            <div className="w-10 h-10 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center sm:hidden flex-shrink-0">
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold" style={{ color: "#EAB308" }}>{stats.pending}</p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 sm:mt-1">pendientes</p>
            </div>
          </div>
        </div>
        <div className={`${CARD} p-4 sm:p-5 relative overflow-hidden`}>
          <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-blue-500/5" />
          <div className="flex sm:flex-col items-center sm:items-center gap-3 sm:gap-0 sm:text-center relative">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center sm:hidden flex-shrink-0">
              <Check className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold" style={{ color: "#3B82F6" }}>{stats.confirmed}</p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 sm:mt-1">confirmadas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      {appointments.length === 0 ? (
        <div className={`${CARD} p-12 text-center`}>
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No hay citas para hoy</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((appt) => (
            <motion.div
              key={appt.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${CARD} p-4 md:p-5`}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
                {/* Time */}
                <div className="flex items-center gap-3 md:min-w-[60px]">
                  <span className="text-lg font-bold text-secondary dark:text-gray-100 font-display">
                    {formatTime(appt.scheduledAt)}
                  </span>
                </div>

                {/* Employee */}
                {appt.employeeName && (
                  <div className="flex items-center gap-2 md:min-w-[140px]">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: "var(--color-primary)" }} />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{appt.employeeName}</span>
                  </div>
                )}

                {/* Service */}
                <div className="md:min-w-[150px]">
                  <span className="text-sm font-medium text-gray-800">{appt.serviceName || "Sin servicio"}</span>
                </div>

                {/* Client */}
                <div className="flex items-center gap-2 md:min-w-[160px]">
                  <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{appt.customerName}</span>
                  {appt.customerPhone && (
                    <a href={`tel:${appt.customerPhone}`} className="text-primary hover:text-primary-700 transition-colors">
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {/* Status + GCal */}
                <div className="flex items-center gap-2 md:min-w-[130px]">
                  <StatusBadge status={appt.status} />
                  <GCalLink appt={appt} clinicName={clinic.name} />
                </div>

                {/* Actions */}
                <div className="md:ml-auto">
                  <AppointmentActions appt={appt} token={token} onUpdate={load} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Tab: Calendario ─────────────────────────────────────────────────

const SHORT_DAY_NAMES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
const CAL_START_HOUR = 8
const CAL_END_HOUR = 21

function getMonday(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay() // 0=Sun, 1=Mon...
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  date.setHours(0, 0, 0, 0)
  return date
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function TabCalendario({ token }: { token: string }) {
  const clinic = useClinic()
  const today = useMemo(() => new Date(), [])
  const [weekStart, setWeekStart] = useState(() => getMonday(today))
  const [appointments, setAppointments] = useState<ManagedAppointment[]>([])
  const [employees, setEmployees] = useState<(BookingEmployee & { active: boolean; serviceIds: string[] })[]>([])
  const [services, setServices] = useState<(BookingService & { active: boolean; sortOrder: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [slotDurationMin, setSlotDurationMin] = useState(30)

  // Detail modal
  const [selectedAppt, setSelectedAppt] = useState<ManagedAppointment | null>(null)

  // Create form
  const [createSlot, setCreateSlot] = useState<{ date: string; time: string } | null>(null)
  const [createEmployee, setCreateEmployee] = useState("")
  const [createService, setCreateService] = useState("")
  const [createName, setCreateName] = useState("")
  const [createPhone, setCreatePhone] = useState("")
  const [createSaving, setCreateSaving] = useState(false)
  const [createError, setCreateError] = useState("")

  // Mobile: single day offset (0=Mon, 6=Sun)
  const [mobileDayOffset, setMobileDayOffset] = useState(() => {
    const dow = today.getDay()
    return dow === 0 ? 6 : dow - 1
  })

  // Current time indicator
  const [now, setNow] = useState(() => new Date())
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(interval)
  }, [])

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart])
  const weekEnd = useMemo(() => addDays(weekStart, 7), [weekStart])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const fromISO = toDateISO(weekStart)
      const toISO = toDateISO(weekEnd)
      const [apptRes, empRes, svcRes, cfgRes] = await Promise.all([
        fetchAppointments(token, { from: fromISO, to: toISO }),
        fetchOwnerEmployees(token),
        fetchOwnerServices(token),
        fetchOwnerConfig(token),
      ])
      setAppointments(apptRes.appointments)
      setEmployees(empRes.employees)
      setServices(svcRes.services)
      if (cfgRes) setSlotDurationMin(Number(cfgRes.slotDurationMin) || 30)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [token, weekStart, weekEnd])

  useEffect(() => { loadData() }, [loadData])

  // Auto-scroll to ~current time on initial load
  useEffect(() => {
    if (!loading && scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
  }, [loading])

  const totalSlots = Math.ceil((CAL_END_HOUR - CAL_START_HOUR) * 60 / slotDurationMin)
  const slotHeightPx = 48
  const hourSlots = 60 / slotDurationMin

  // Group appointments by day
  const apptsByDay = useMemo(() => {
    const map: Record<string, ManagedAppointment[]> = {}
    for (const appt of appointments) {
      const d = new Date(appt.scheduledAt)
      const key = toDateISO(d)
      if (!map[key]) map[key] = []
      map[key].push(appt)
    }
    return map
  }, [appointments])

  function getApptPosition(appt: ManagedAppointment) {
    const d = new Date(appt.scheduledAt)
    const minutesSinceStart = (d.getHours() - CAL_START_HOUR) * 60 + d.getMinutes()
    const top = (minutesSinceStart / slotDurationMin) * slotHeightPx
    const height = (appt.durationMin / slotDurationMin) * slotHeightPx
    return { top: Math.max(0, top), height: Math.max(slotHeightPx * 0.5, height) }
  }

  function getCurrentTimePosition() {
    const minutesSinceStart = (now.getHours() - CAL_START_HOUR) * 60 + now.getMinutes()
    if (minutesSinceStart < 0 || minutesSinceStart > (CAL_END_HOUR - CAL_START_HOUR) * 60) return null
    return (minutesSinceStart / slotDurationMin) * slotHeightPx
  }

  function handleCellClick(dayIndex: number, slotIndex: number) {
    const day = weekDays[dayIndex]
    const totalMinutes = CAL_START_HOUR * 60 + slotIndex * slotDurationMin
    const hours = Math.floor(totalMinutes / 60)
    const mins = totalMinutes % 60
    const dateStr = toDateISO(day)
    const timeStr = `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`
    setCreateSlot({ date: dateStr, time: timeStr })
    setCreateEmployee(employees.length > 0 ? employees[0].id : "")
    const activeServices = services.filter(s => s.active)
    setCreateService(activeServices.length > 0 ? activeServices[0].id : "")
    setCreateName("")
    setCreatePhone("")
    setCreateError("")
  }

  async function handleCreate() {
    if (!createSlot || !createEmployee || !createService || !createName.trim() || !createPhone.trim()) {
      setCreateError("Completa todos los campos obligatorios")
      return
    }
    setCreateSaving(true)
    setCreateError("")
    try {
      await manualCreateBooking(token, {
        employeeId: createEmployee,
        serviceId: createService,
        date: createSlot.date,
        time: createSlot.time,
        customer: { name: createName.trim(), phone: createPhone.trim() },
      })
      setCreateSlot(null)
      await loadData()
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Error al crear cita")
    } finally {
      setCreateSaving(false)
    }
  }

  const weekLabel = useMemo(() => {
    const s = weekDays[0]
    const e = weekDays[6]
    const sMonth = s.toLocaleDateString("es-ES", { month: "short" })
    const eMonth = e.toLocaleDateString("es-ES", { month: "short" })
    if (sMonth === eMonth) return `${s.getDate()} - ${e.getDate()} ${sMonth} ${e.getFullYear()}`
    return `${s.getDate()} ${sMonth} - ${e.getDate()} ${eMonth} ${e.getFullYear()}`
  }, [weekDays])

  function goToday() {
    setWeekStart(getMonday(today))
    const dow = today.getDay()
    setMobileDayOffset(dow === 0 ? 6 : dow - 1)
  }

  function prevWeek() { setWeekStart(prev => addDays(prev, -7)) }
  function nextWeek() { setWeekStart(prev => addDays(prev, 7)) }

  function prevDay() {
    setMobileDayOffset(prev => {
      if (prev <= 0) { setWeekStart(ws => addDays(ws, -7)); return 6 }
      return prev - 1
    })
  }
  function nextDay() {
    setMobileDayOffset(prev => {
      if (prev >= 6) { setWeekStart(ws => addDays(ws, 7)); return 0 }
      return prev + 1
    })
  }

  const timeLabels = useMemo(() =>
    Array.from({ length: totalSlots }, (_, i) => {
      const totalMin = CAL_START_HOUR * 60 + i * slotDurationMin
      const h = Math.floor(totalMin / 60)
      const m = totalMin % 60
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
    }), [totalSlots, slotDurationMin])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const currentTimeTop = getCurrentTimePosition()
  const gridHeight = totalSlots * slotHeightPx

  // ── Desktop Week View ──
  function renderWeekGrid() {
    return (
      <div className={`hidden md:block ${CARD} overflow-hidden`}>
        {/* Day headers */}
        <div className="grid border-b border-black/[0.04] dark:border-white/[0.06]" style={{ gridTemplateColumns: "60px repeat(7, 1fr)" }}>
          <div className="p-2" />
          {weekDays.map((day, i) => {
            const isToday = isSameDay(day, today)
            return (
              <div
                key={i}
                className={`p-2 text-center border-l border-black/[0.04] dark:border-white/[0.06] ${isToday ? "bg-blue-50/50 dark:bg-blue-900/20" : ""}`}
              >
                <p className="text-xs text-gray-500 font-medium">{SHORT_DAY_NAMES[i]}</p>
                <p className={`text-lg font-bold ${isToday ? "text-primary" : "text-secondary"}`}>{day.getDate()}</p>
              </div>
            )
          })}
        </div>

        {/* Grid body */}
        <div ref={scrollRef} className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 260px)" }}>
          <div className="relative grid" style={{ gridTemplateColumns: "60px repeat(7, 1fr)", height: gridHeight }}>
            {/* Time labels column */}
            <div className="relative">
              {timeLabels.map((label, i) => (
                <div
                  key={i}
                  className="absolute right-2 text-[10px] text-gray-400 font-medium -translate-y-1/2"
                  style={{ top: i * slotHeightPx }}
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map((day, dayIdx) => {
              const dayKey = toDateISO(day)
              const dayAppts = apptsByDay[dayKey] || []
              const isToday = isSameDay(day, today)
              return (
                <div key={dayIdx} className={`relative border-l border-black/[0.04] dark:border-white/[0.06] ${isToday ? "bg-blue-50/30 dark:bg-blue-900/20" : ""}`}>
                  {/* Slot click areas */}
                  {Array.from({ length: totalSlots }, (_, slotIdx) => (
                    <div
                      key={slotIdx}
                      className="absolute inset-x-0 border-t border-gray-50 hover:bg-primary/5 cursor-pointer transition-colors"
                      style={{ top: slotIdx * slotHeightPx, height: slotHeightPx }}
                      onClick={() => handleCellClick(dayIdx, slotIdx)}
                    />
                  ))}

                  {/* Hour lines (thicker) */}
                  {Array.from({ length: CAL_END_HOUR - CAL_START_HOUR }, (_, h) => (
                    <div
                      key={`hr-${h}`}
                      className="absolute inset-x-0 border-t border-gray-200 pointer-events-none"
                      style={{ top: h * hourSlots * slotHeightPx }}
                    />
                  ))}

                  {/* Appointments */}
                  {dayAppts.map((appt) => {
                    const { top, height } = getApptPosition(appt)
                    const statusInfo = STATUS_MAP[appt.status] || { color: "#6B7280", bg: "#6B728015" }
                    return (
                      <div
                        key={appt.id}
                        className="absolute left-0.5 right-0.5 rounded-md px-1.5 py-0.5 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity z-10"
                        style={{
                          top,
                          height,
                          backgroundColor: statusInfo.bg,
                          borderLeft: `3px solid ${statusInfo.color}`,
                        }}
                        onClick={(e) => { e.stopPropagation(); setSelectedAppt(appt) }}
                      >
                        <p className="text-[10px] font-bold text-gray-700 dark:text-gray-200 truncate leading-tight">
                          {formatTime(appt.scheduledAt)} {appt.customerName}
                        </p>
                        {height >= slotHeightPx * 0.8 && (
                          <p className="text-[10px] text-gray-500 truncate leading-tight">
                            {appt.serviceName || ""}
                          </p>
                        )}
                      </div>
                    )
                  })}

                  {/* Current time indicator */}
                  {isToday && currentTimeTop !== null && (
                    <div className="absolute inset-x-0 z-20 pointer-events-none" style={{ top: currentTimeTop }}>
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-red-500 -ml-1 flex-shrink-0" />
                        <div className="flex-1 h-[2px] bg-red-500" />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ── Mobile Single Day View ──
  function renderMobileDay() {
    const day = weekDays[mobileDayOffset] || weekDays[0]
    const dayKey = toDateISO(day)
    const dayAppts = apptsByDay[dayKey] || []
    const isToday = isSameDay(day, today)
    const dayLabel = day.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })

    return (
      <div className="md:hidden space-y-4">
        {/* Mobile day nav */}
        <div className={`flex items-center justify-between ${CARD} p-3`}>
          <button onClick={prevDay} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <p className={`text-sm font-semibold capitalize ${isToday ? "text-primary" : "text-secondary dark:text-gray-100"}`}>{dayLabel}</p>
          <button onClick={nextDay} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Mobile time grid */}
        <div className={`${CARD} overflow-hidden`}>
          <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 320px)" }}>
            <div className="relative" style={{ height: gridHeight }}>
              {/* Slot rows */}
              {Array.from({ length: totalSlots }, (_, slotIdx) => (
                <div
                  key={slotIdx}
                  className="absolute inset-x-0 flex border-t border-gray-50 hover:bg-primary/5 cursor-pointer transition-colors"
                  style={{ top: slotIdx * slotHeightPx, height: slotHeightPx }}
                  onClick={() => handleCellClick(mobileDayOffset, slotIdx)}
                >
                  <div className="w-14 flex-shrink-0 flex items-start justify-end pr-2 pt-0.5">
                    <span className="text-[10px] text-gray-400 font-medium">{timeLabels[slotIdx]}</span>
                  </div>
                  <div className="flex-1 border-l border-gray-100" />
                </div>
              ))}

              {/* Hour lines */}
              {Array.from({ length: CAL_END_HOUR - CAL_START_HOUR }, (_, h) => (
                <div
                  key={`hr-${h}`}
                  className="absolute left-14 right-0 border-t border-gray-200 pointer-events-none"
                  style={{ top: h * hourSlots * slotHeightPx }}
                />
              ))}

              {/* Appointments */}
              {dayAppts.map((appt) => {
                const { top, height } = getApptPosition(appt)
                const statusInfo = STATUS_MAP[appt.status] || { color: "#6B7280", bg: "#6B728015" }
                return (
                  <div
                    key={appt.id}
                    className="absolute rounded-md px-2 py-0.5 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity z-10"
                    style={{
                      top,
                      height,
                      left: "3.75rem",
                      right: "0.25rem",
                      backgroundColor: statusInfo.bg,
                      borderLeft: `3px solid ${statusInfo.color}`,
                    }}
                    onClick={(e) => { e.stopPropagation(); setSelectedAppt(appt) }}
                  >
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-200 truncate leading-tight">
                      {formatTime(appt.scheduledAt)} {appt.customerName}
                    </p>
                    {height >= slotHeightPx * 0.8 && (
                      <p className="text-[11px] text-gray-500 truncate leading-tight">
                        {appt.serviceName || ""}
                      </p>
                    )}
                  </div>
                )
              })}

              {/* Current time */}
              {isToday && currentTimeTop !== null && (
                <div className="absolute left-14 right-0 z-20 pointer-events-none" style={{ top: currentTimeTop }}>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-red-500 -ml-1 flex-shrink-0" />
                    <div className="flex-1 h-[2px] bg-red-500" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-2xl font-bold text-secondary dark:text-gray-100 font-display">Calendario</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={prevWeek}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-200 dark:border-gray-600"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={goToday}
            className="px-3 py-1.5 text-sm font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
          >
            Hoy
          </button>
          <button
            onClick={nextWeek}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-200 dark:border-gray-600"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
          <span className="text-sm text-gray-600 font-medium ml-2 hidden sm:inline capitalize">{weekLabel}</span>
        </div>
      </div>

      {/* Desktop grid */}
      {renderWeekGrid()}

      {/* Mobile single day */}
      {renderMobileDay()}

      {/* ── Detail Modal ── */}
      <AnimatePresence>
        {selectedAppt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4"
            onClick={() => setSelectedAppt(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-black/[0.04] dark:border-white/[0.06] shadow-2xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between p-5 border-b border-black/[0.04] dark:border-white/[0.06]">
                <h3 className="text-lg font-bold text-secondary dark:text-gray-100 font-display">Detalle de cita</h3>
                <button onClick={() => setSelectedAppt(null)} className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal body */}
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-secondary">{formatTime(selectedAppt.scheduledAt)}</span>
                  <StatusBadge status={selectedAppt.status} />
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{selectedAppt.customerName}</span>
                  </div>
                  {selectedAppt.customerPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <a href={`tel:${selectedAppt.customerPhone}`} className="text-primary hover:text-primary-700 transition-colors underline">
                        {selectedAppt.customerPhone}
                      </a>
                    </div>
                  )}
                  {selectedAppt.serviceName && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{selectedAppt.serviceName} ({selectedAppt.durationMin} min)</span>
                    </div>
                  )}
                  {selectedAppt.employeeName && (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--color-primary)" }} />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">{selectedAppt.employeeName}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{formatShortDate(selectedAppt.scheduledAt)}</span>
                  </div>
                  <p className="text-gray-400 text-xs font-mono pt-1">
                    Codigo: {selectedAppt.confirmationCode} | Fuente: {selectedAppt.source}
                  </p>
                  <GCalLink appt={selectedAppt} clinicName={clinic.name} />
                </div>
              </div>

              {/* Modal actions */}
              <div className="p-5 border-t border-black/[0.04] dark:border-white/[0.06] bg-gray-50/80 dark:bg-gray-800/80">
                <AppointmentActions appt={selectedAppt} token={token} onUpdate={() => { setSelectedAppt(null); loadData() }} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Create Appointment Modal ── */}
      <AnimatePresence>
        {createSlot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4"
            onClick={() => setCreateSlot(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-black/[0.04] dark:border-white/[0.06] shadow-2xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-black/[0.04] dark:border-white/[0.06]">
                <h3 className="text-lg font-bold text-secondary dark:text-gray-100 font-display">Nueva cita manual</h3>
                <button onClick={() => setCreateSlot(null)} className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                {/* Date + Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Fecha</label>
                    <input
                      type="date"
                      value={createSlot.date}
                      onChange={(e) => setCreateSlot({ ...createSlot, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Hora</label>
                    <input
                      type="time"
                      value={createSlot.time}
                      onChange={(e) => setCreateSlot({ ...createSlot, time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
                    />
                  </div>
                </div>

                {/* Employee */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Profesional *</label>
                  <select
                    value={createEmployee}
                    onChange={(e) => setCreateEmployee(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all bg-white dark:bg-gray-700"
                  >
                    <option value="">Seleccionar...</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}{emp.role ? ` \u2014 ${emp.role}` : ""}</option>
                    ))}
                  </select>
                </div>

                {/* Service */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Servicio *</label>
                  <select
                    value={createService}
                    onChange={(e) => setCreateService(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all bg-white dark:bg-gray-700"
                  >
                    <option value="">Seleccionar...</option>
                    {services.filter(s => s.active).map(svc => (
                      <option key={svc.id} value={svc.id}>{svc.name} ({svc.durationMin} min){svc.price ? ` \u2014 ${svc.price}\u20AC` : ""}</option>
                    ))}
                  </select>
                </div>

                {/* Customer name */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Nombre del cliente *</label>
                  <input
                    type="text"
                    placeholder="Nombre completo"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
                  />
                </div>

                {/* Customer phone */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Telefono *</label>
                  <input
                    type="tel"
                    placeholder="612345678"
                    value={createPhone}
                    onChange={(e) => setCreatePhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
                  />
                </div>

                {/* Error */}
                {createError && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{createError}</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-black/[0.04] dark:border-white/[0.06] bg-gray-50/80 dark:bg-gray-800/80 flex items-center gap-3">
                <button
                  onClick={handleCreate}
                  disabled={createSaving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:brightness-110 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span className="relative z-10">Crear cita</span>
                </button>
                <button
                  onClick={() => setCreateSlot(null)}
                  className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Tab: Citas ──────────────────────────────────────────────────────

function TabCitas({ token }: { token: string }) {
  const clinic = useClinic()
  const [appointments, setAppointments] = useState<ManagedAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [filterStatus, setFilterStatus] = useState("")
  const [filterFrom, setFilterFrom] = useState("")
  const [filterTo, setFilterTo] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number> = { page }
      if (filterStatus) params.status = filterStatus
      if (filterFrom) params.from = filterFrom
      if (filterTo) params.to = filterTo
      const res = await fetchAppointments(token, params as Parameters<typeof fetchAppointments>[1])
      setAppointments(res.appointments)
      setHasMore(res.appointments.length >= res.limit)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [token, page, filterStatus, filterFrom, filterTo])

  useEffect(() => { load() }, [load])

  function handleFilterChange() {
    setPage(1)
  }

  function exportCSV() {
    const headers = ["Fecha", "Hora", "Profesional", "Servicio", "Cliente", "Teléfono", "Estado", "Código"]
    const rows = appointments.map(a => [
      formatShortDate(a.scheduledAt).split(" ")[0],
      formatShortDate(a.scheduledAt).split(" ")[1],
      a.employeeName || "",
      a.serviceName || "",
      a.customerName,
      a.customerPhone,
      STATUS_MAP[a.status]?.label || a.status,
      a.confirmationCode,
    ])
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `citas-${toDateISO(new Date())}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold text-secondary dark:text-gray-100 font-display">Citas</h2>
        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Exportar CSV</span>
        </button>
      </div>

      {/* Filters */}
      <div className={`${CARD} p-4`}>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); handleFilterChange() }}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all bg-white dark:bg-gray-700"
          >
            <option value="">Todas</option>
            <option value="pending">Pendiente</option>
            <option value="confirmed">Confirmada</option>
            <option value="completed">Completada</option>
            <option value="cancelled">Cancelada</option>
            <option value="no_show">No show</option>
          </select>
          <input
            type="date"
            value={filterFrom}
            onChange={(e) => { setFilterFrom(e.target.value); handleFilterChange() }}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
            placeholder="Desde"
          />
          <input
            type="date"
            value={filterTo}
            onChange={(e) => { setFilterTo(e.target.value); handleFilterChange() }}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
            placeholder="Hasta"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : appointments.length === 0 ? (
        <div className={`${CARD} p-12 text-center`}>
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No hay citas con estos filtros</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className={`hidden md:block ${CARD} overflow-hidden`}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/[0.04] dark:border-white/[0.06] bg-gray-50/80 dark:bg-gray-800/80">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Fecha/Hora</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Profesional</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Servicio</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Cliente</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Teléfono</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Estado</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Código</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt) => (
                  <tr key={appt.id} className="border-b border-black/[0.03] dark:border-white/[0.04] hover:bg-primary/[0.03] dark:hover:bg-primary/[0.05] transition-colors">
                    <td className="px-4 py-3 font-medium">{formatShortDate(appt.scheduledAt)}</td>
                    <td className="px-4 py-3 text-gray-600">{appt.employeeName || "-"}</td>
                    <td className="px-4 py-3 text-gray-600">{appt.serviceName || "-"}</td>
                    <td className="px-4 py-3">{appt.customerName}</td>
                    <td className="px-4 py-3">
                      {appt.customerPhone ? (
                        <a href={`tel:${appt.customerPhone}`} className="text-primary hover:text-primary-700 transition-colors underline">
                          {appt.customerPhone}
                        </a>
                      ) : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={appt.status} />
                        <GCalLink appt={appt} clinicName={clinic.name} />
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{appt.confirmationCode}</td>
                    <td className="px-4 py-3">
                      <AppointmentActions appt={appt} token={token} onUpdate={load} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {appointments.map((appt) => (
              <motion.div
                key={appt.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${CARD} p-4 space-y-3`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-secondary">{formatShortDate(appt.scheduledAt)}</span>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={appt.status} />
                    <GCalLink appt={appt} clinicName={clinic.name} />
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  {appt.employeeName && (
                    <p className="text-gray-600">Profesional: <span className="font-medium text-gray-800">{appt.employeeName}</span></p>
                  )}
                  <p className="text-gray-600">Servicio: <span className="font-medium text-gray-800">{appt.serviceName || "-"}</span></p>
                  <p className="text-gray-600">
                    Cliente: <span className="font-medium text-gray-800">{appt.customerName}</span>
                    {appt.customerPhone && (
                      <a href={`tel:${appt.customerPhone}`} className="ml-2 text-primary hover:text-primary-700 transition-colors">
                        <Phone className="w-3.5 h-3.5 inline" />
                      </a>
                    )}
                  </p>
                  <p className="text-gray-400 text-xs font-mono">Codigo: {appt.confirmationCode}</p>
                </div>
                <AppointmentActions appt={appt} token={token} onUpdate={load} />
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>
            <span className="text-sm text-gray-500">Página {page}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={!hasMore}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Siguiente <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Tab: Clientes ──────────────────────────────────────────────────

interface ClientSummary {
  customerPhone: string
  customerName: string
  customerEmail: string | null
  totalVisits: number
  lastVisitDate: string
  appointments: ManagedAppointment[]
}

function TabClientes({ token }: { token: string }) {
  const [allAppointments, setAllAppointments] = useState<ManagedAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [selectedClient, setSelectedClient] = useState<ClientSummary | null>(null)
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Fetch all appointments (paginate through all pages)
  useEffect(() => {
    let cancelled = false
    async function loadAll() {
      setLoading(true)
      try {
        const all: ManagedAppointment[] = []
        let currentPage = 1
        let keepGoing = true
        while (keepGoing) {
          const res = await fetchAppointments(token, { page: currentPage })
          all.push(...res.appointments)
          if (res.appointments.length < res.limit) {
            keepGoing = false
          } else {
            currentPage++
            // Safety cap to avoid infinite loops
            if (currentPage > 100) keepGoing = false
          }
        }
        if (!cancelled) setAllAppointments(all)
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadAll()
    return () => { cancelled = true }
  }, [token])

  // Debounced search
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current)
    }
  }, [searchQuery])

  // Build client list grouped by phone
  const clients = useMemo<ClientSummary[]>(() => {
    const map = new Map<string, ClientSummary>()
    for (const appt of allAppointments) {
      const key = appt.customerPhone || appt.customerName
      const existing = map.get(key)
      if (existing) {
        existing.totalVisits++
        existing.appointments.push(appt)
        // Use the most recent name/email
        if (new Date(appt.scheduledAt) > new Date(existing.lastVisitDate)) {
          existing.lastVisitDate = appt.scheduledAt
          existing.customerName = appt.customerName
          if (appt.customerEmail) existing.customerEmail = appt.customerEmail
        }
      } else {
        map.set(key, {
          customerPhone: appt.customerPhone,
          customerName: appt.customerName,
          customerEmail: appt.customerEmail,
          totalVisits: 1,
          lastVisitDate: appt.scheduledAt,
          appointments: [appt],
        })
      }
    }
    // Sort appointments within each client (newest first)
    for (const client of map.values()) {
      client.appointments.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
    }
    // Sort clients by most recent visit
    const list = Array.from(map.values())
    list.sort((a, b) => new Date(b.lastVisitDate).getTime() - new Date(a.lastVisitDate).getTime())
    return list
  }, [allAppointments])

  // Filter by search
  const filteredClients = useMemo(() => {
    if (!debouncedQuery.trim()) return clients
    const q = debouncedQuery.toLowerCase().trim()
    return clients.filter(
      (c) =>
        c.customerName.toLowerCase().includes(q) ||
        c.customerPhone.toLowerCase().includes(q) ||
        (c.customerEmail && c.customerEmail.toLowerCase().includes(q))
    )
  }, [clients, debouncedQuery])

  // Client detail view
  if (selectedClient) {
    const client = selectedClient
    const completed = client.appointments.filter((a) => a.status === "completed").length
    const cancelled = client.appointments.filter((a) => a.status === "cancelled").length
    const noShows = client.appointments.filter((a) => a.status === "no_show").length
    const pending = client.appointments.filter((a) => a.status === "pending" || a.status === "confirmed").length

    return (
      <div className="space-y-6">
        {/* Back button + header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedClient(null)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-secondary dark:hover:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
        </div>

        {/* Client info header */}
        <div className={`${CARD} p-5`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-secondary dark:text-gray-100 font-display">{client.customerName}</h2>
                <div className="flex flex-wrap items-center gap-3 mt-1">
                  {client.customerPhone && (
                    <span className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Phone className="w-3.5 h-3.5" />
                      {client.customerPhone}
                    </span>
                  )}
                  {client.customerEmail && (
                    <span className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Mail className="w-3.5 h-3.5" />
                      {client.customerEmail}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {client.customerPhone && (
                <a
                  href={`tel:${client.customerPhone}`}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-600 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  Llamar
                </a>
              )}
              {client.customerEmail && (
                <a
                  href={`mailto:${client.customerEmail}`}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  <Mail className="w-4 h-4" />
                  Email
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className={`${CARD} p-4 text-center`}>
            <p className="text-2xl font-bold text-secondary dark:text-gray-100">{client.totalVisits}</p>
            <p className="text-xs text-gray-500 mt-1">Total citas</p>
          </div>
          <div className={`${CARD} p-4 text-center`}>
            <p className="text-2xl font-bold" style={{ color: "#22C55E" }}>{completed}</p>
            <p className="text-xs text-gray-500 mt-1">Completadas</p>
          </div>
          <div className={`${CARD} p-4 text-center`}>
            <p className="text-2xl font-bold" style={{ color: "#EF4444" }}>{cancelled}</p>
            <p className="text-xs text-gray-500 mt-1">Canceladas</p>
          </div>
          <div className={`${CARD} p-4 text-center`}>
            <p className="text-2xl font-bold" style={{ color: "#9CA3AF" }}>{noShows}</p>
            <p className="text-xs text-gray-500 mt-1">No shows</p>
          </div>
        </div>

        {pending > 0 && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-500 flex-shrink-0" />
            <p className="text-sm text-blue-700">
              <span className="font-semibold">{pending}</span> cita{pending > 1 ? "s" : ""} pendiente{pending > 1 ? "s" : ""} o confirmada{pending > 1 ? "s" : ""}
            </p>
          </div>
        )}

        {/* Appointment history */}
        <div>
          <h3 className="text-lg font-bold text-secondary dark:text-gray-100 font-display mb-4">Historial de citas</h3>

          {/* Desktop Table */}
          <div className={`hidden md:block ${CARD} overflow-hidden`}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/[0.04] dark:border-white/[0.06] bg-gray-50/80 dark:bg-gray-800/80">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Fecha/Hora</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Servicio</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Profesional</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Estado</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Código</th>
                </tr>
              </thead>
              <tbody>
                {client.appointments.map((appt) => (
                  <tr key={appt.id} className="border-b border-black/[0.03] dark:border-white/[0.04] hover:bg-primary/[0.03] dark:hover:bg-primary/[0.05] transition-colors">
                    <td className="px-4 py-3 font-medium">{formatShortDate(appt.scheduledAt)}</td>
                    <td className="px-4 py-3 text-gray-600">{appt.serviceName || "-"}</td>
                    <td className="px-4 py-3 text-gray-600">{appt.employeeName || "-"}</td>
                    <td className="px-4 py-3"><StatusBadge status={appt.status} /></td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{appt.confirmationCode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {client.appointments.map((appt) => (
              <motion.div
                key={appt.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${CARD} p-4 space-y-2`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-secondary">{formatShortDate(appt.scheduledAt)}</span>
                  <StatusBadge status={appt.status} />
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">Servicio: <span className="font-medium text-gray-800">{appt.serviceName || "-"}</span></p>
                  {appt.employeeName && (
                    <p className="text-gray-600">Profesional: <span className="font-medium text-gray-800">{appt.employeeName}</span></p>
                  )}
                  <p className="text-gray-400 text-xs font-mono flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    {appt.confirmationCode}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Main client list view
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-secondary dark:text-gray-100 font-display">Clientes</h2>

      {/* Search bar */}
      <div className={`${CARD} p-4`}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, teléfono o email..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all placeholder:text-gray-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredClients.length === 0 ? (
        <div className={`${CARD} p-12 text-center`}>
          <ContactRound className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {debouncedQuery ? "No se encontraron clientes con esa búsqueda" : "No hay clientes registrados aún"}
          </p>
        </div>
      ) : (
        <>
          {/* Summary */}
          <p className="text-sm text-gray-500">
            {filteredClients.length} cliente{filteredClients.length !== 1 ? "s" : ""}
            {debouncedQuery ? " encontrados" : " en total"}
          </p>

          {/* Desktop Table */}
          <div className={`hidden md:block ${CARD} overflow-hidden`}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/[0.04] dark:border-white/[0.06] bg-gray-50/80 dark:bg-gray-800/80">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Cliente</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Teléfono</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Email</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Visitas</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Última visita</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr
                    key={client.customerPhone || client.customerName}
                    onClick={() => setSelectedClient(client)}
                    className="border-b border-black/[0.03] dark:border-white/[0.04] hover:bg-primary/[0.03] dark:hover:bg-primary/[0.05] transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-medium text-secondary dark:text-gray-100">{client.customerName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {client.customerPhone ? (
                        <a
                          href={`tel:${client.customerPhone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-primary hover:text-primary-700 transition-colors underline"
                        >
                          {client.customerPhone}
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{client.customerEmail || "-"}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                        {client.totalVisits}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatShortDate(client.lastVisitDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredClients.map((client) => (
              <motion.div
                key={client.customerPhone || client.customerName}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedClient(client)}
                className={`${CARD} p-4 space-y-3 cursor-pointer active:bg-gray-50 dark:active:bg-gray-700 transition-colors`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-secondary dark:text-gray-100 text-sm">{client.customerName}</p>
                      {client.customerPhone && (
                        <p className="text-xs text-gray-500">{client.customerPhone}</p>
                      )}
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                    {client.totalVisits} visita{client.totalVisits !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Última visita: {formatShortDate(client.lastVisitDate)}</span>
                  {client.customerEmail && (
                    <span className="truncate ml-2">{client.customerEmail}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Tab: Servicios ──────────────────────────────────────────────────

type ManagedService = BookingService & { active: boolean; sortOrder: number }

function TabServicios({ token }: { token: string }) {
  const [services, setServices] = useState<ManagedService[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Form state
  const [formName, setFormName] = useState("")
  const [formDuration, setFormDuration] = useState(60)
  const [formPrice, setFormPrice] = useState("")
  const [formDescription, setFormDescription] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchOwnerServices(token)
      setServices(res.services)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { load() }, [load])

  function resetForm() {
    setFormName("")
    setFormDuration(60)
    setFormPrice("")
    setFormDescription("")
    setShowForm(false)
    setEditingId(null)
  }

  async function handleCreate() {
    if (!formName.trim()) return
    setSaving(true)
    try {
      await manageService(token, {
        action: "create",
        name: formName.trim(),
        durationMin: formDuration,
        price: formPrice || null,
      })
      resetForm()
      await load()
    } catch {
      // ignore
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdate(svc: ManagedService) {
    setSaving(true)
    try {
      await manageService(token, {
        action: "update",
        id: svc.id,
        name: formName.trim() || svc.name,
        durationMin: formDuration,
        price: formPrice || svc.price,
        description: formDescription || svc.description,
      })
      resetForm()
      await load()
    } catch {
      // ignore
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleActive(svc: ManagedService) {
    try {
      await manageService(token, { action: "update", id: svc.id, active: !svc.active })
      await load()
    } catch {
      // ignore
    }
  }

  function startEdit(svc: ManagedService) {
    setEditingId(svc.id)
    setFormName(svc.name)
    setFormDuration(svc.durationMin)
    setFormPrice(svc.price || "")
    setFormDescription(svc.description || "")
    setShowForm(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const durationOptions = Array.from({ length: 12 }, (_, i) => (i + 1) * 15)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-secondary dark:text-gray-100 font-display">Servicios</h2>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-4 h-4" /> Añadir servicio
        </button>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`${CARD} p-5 space-y-4 overflow-hidden`}
          >
            <h3 className="font-semibold text-secondary dark:text-gray-100">Nuevo servicio</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Nombre del servicio"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
              />
              <select
                value={formDuration}
                onChange={(e) => setFormDuration(Number(e.target.value))}
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all bg-white dark:bg-gray-700"
              >
                {durationOptions.map(d => (
                  <option key={d} value={d}>{d} min</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Precio (ej: 50)"
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCreate}
                disabled={saving || !formName.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:brightness-110 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                <span className="relative z-10">Crear</span>
              </button>
              <button
                onClick={resetForm}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Services list */}
      <div className="space-y-3">
        {services.map((svc) => (
          <div key={svc.id} className={`${CARD} overflow-hidden`}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 sm:p-5">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-secondary dark:text-gray-100 truncate">{svc.name}</p>
                {svc.description && <p className="text-xs text-gray-500 mt-0.5 truncate">{svc.description}</p>}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>{svc.durationMin} min</span>
                {svc.price && <span className="font-medium">{svc.price}&euro;</span>}
              </div>
              <div className="flex items-center gap-3">
                {/* Active toggle */}
                <button
                  onClick={() => handleToggleActive(svc)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${svc.active ? "bg-green-400" : "bg-gray-300"}`}
                  aria-label={svc.active ? "Desactivar" : "Activar"}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${svc.active ? "translate-x-5" : "translate-x-0"}`}
                  />
                </button>
                {/* Edit */}
                <button
                  onClick={() => editingId === svc.id ? resetForm() : startEdit(svc)}
                  className="p-1.5 text-gray-400 hover:text-primary transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Inline edit form */}
            <AnimatePresence>
              {editingId === svc.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-black/[0.04] dark:border-white/[0.06] p-4 sm:p-5 space-y-4 bg-gray-50/80 dark:bg-gray-800/80 overflow-hidden"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Nombre"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
                    />
                    <select
                      value={formDuration}
                      onChange={(e) => setFormDuration(Number(e.target.value))}
                      className="px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all bg-white dark:bg-gray-700"
                    >
                      {durationOptions.map(d => (
                        <option key={d} value={d}>{d} min</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Precio"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      className="px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
                    />
                    <input
                      type="text"
                      placeholder="Descripción"
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      className="px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleUpdate(svc)}
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:brightness-110 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                      <span className="relative z-10">Guardar</span>
                    </button>
                    <button
                      onClick={resetForm}
                      className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        {services.length === 0 && (
          <div className={`${CARD} p-12 text-center`}>
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay servicios configurados</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Tab: Equipo ────────────────────────────────────────────────────

type ManagedEmployee = BookingEmployee & { active: boolean; serviceIds: string[] }

function TabEquipo({ token }: { token: string }) {
  const [employees, setEmployees] = useState<ManagedEmployee[]>([])
  const [services, setServices] = useState<ManagedService[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Form state
  const [formName, setFormName] = useState("")
  const [formRole, setFormRole] = useState("")
  const [formServiceIds, setFormServiceIds] = useState<string[]>([])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [empRes, svcRes] = await Promise.all([
        fetchOwnerEmployees(token),
        fetchOwnerServices(token),
      ])
      setEmployees(empRes.employees)
      setServices(svcRes.services)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { load() }, [load])

  function resetForm() {
    setFormName("")
    setFormRole("")
    setFormServiceIds([])
    setShowForm(false)
    setEditingId(null)
  }

  async function handleCreate() {
    if (!formName.trim()) return
    setSaving(true)
    try {
      await manageEmployee(token, {
        action: "create",
        name: formName.trim(),
        role: formRole.trim() || null,
      })
      resetForm()
      await load()
    } catch {
      // ignore
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdate(emp: ManagedEmployee) {
    setSaving(true)
    try {
      await manageEmployee(token, {
        action: "update",
        id: emp.id,
        name: formName.trim() || emp.name,
        role: formRole.trim() || null,
        serviceIds: formServiceIds,
        active: emp.active,
      })
      resetForm()
      await load()
    } catch {
      // ignore
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleActive(emp: ManagedEmployee) {
    try {
      await manageEmployee(token, { action: "update", id: emp.id, active: !emp.active })
      await load()
    } catch {
      // ignore
    }
  }

  function startEdit(emp: ManagedEmployee) {
    setEditingId(emp.id)
    setFormName(emp.name)
    setFormRole(emp.role || "")
    setFormServiceIds(emp.serviceIds || [])
    setShowForm(false)
  }

  function toggleServiceId(id: string) {
    setFormServiceIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const activeServices = services.filter((s) => s.active)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-secondary dark:text-gray-100 font-display">Equipo</h2>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-4 h-4" /> Añadir profesional
        </button>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`${CARD} p-5 space-y-4 overflow-hidden`}
          >
            <h3 className="font-semibold text-secondary dark:text-gray-100">Nuevo profesional</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nombre *"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
              />
              <input
                type="text"
                placeholder="Ej: Fisioterapeuta"
                value={formRole}
                onChange={(e) => setFormRole(e.target.value)}
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCreate}
                disabled={saving || !formName.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:brightness-110 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                <span className="relative z-10">Crear</span>
              </button>
              <button
                onClick={resetForm}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Employee list */}
      <div className="space-y-3">
        {employees.map((emp) => (
          <div key={emp.id} className={`${CARD} overflow-hidden`}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 sm:p-5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-secondary dark:text-gray-100 truncate">{emp.name}</p>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      emp.active
                        ? "bg-green-50 text-green-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {emp.active ? "Activo" : "Inactivo"}
                  </span>
                </div>
                {emp.role && (
                  <p className="text-xs text-gray-500 mt-0.5">{emp.role}</p>
                )}
                {/* Assigned services pills */}
                {emp.serviceIds && emp.serviceIds.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {emp.serviceIds.map((sid) => {
                      const svc = services.find((s) => s.id === sid)
                      if (!svc) return null
                      return (
                        <span
                          key={sid}
                          className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-50 text-[11px] text-gray-600 border border-gray-100"
                        >
                          {svc.name}
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                {/* Active toggle */}
                <button
                  onClick={() => handleToggleActive(emp)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${emp.active ? "bg-green-400" : "bg-gray-300"}`}
                  aria-label={emp.active ? "Desactivar" : "Activar"}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${emp.active ? "translate-x-5" : "translate-x-0"}`}
                  />
                </button>
                {/* Edit */}
                <button
                  onClick={() => editingId === emp.id ? resetForm() : startEdit(emp)}
                  className="p-1.5 text-gray-400 hover:text-primary transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Inline edit form */}
            <AnimatePresence>
              {editingId === emp.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-black/[0.04] dark:border-white/[0.06] p-4 sm:p-5 space-y-4 bg-gray-50/80 dark:bg-gray-800/80 overflow-hidden"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Nombre"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
                    />
                    <input
                      type="text"
                      placeholder="Rol"
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value)}
                      className="px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
                    />
                  </div>

                  {/* Service assignment checkboxes */}
                  {activeServices.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-secondary mb-2">Servicios asignados</p>
                      <div className="flex flex-wrap gap-2">
                        {activeServices.map((svc) => {
                          const checked = formServiceIds.includes(svc.id)
                          return (
                            <label
                              key={svc.id}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm cursor-pointer transition-colors border ${
                                checked
                                  ? "bg-primary/10 border-primary/30 text-primary font-medium"
                                  : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleServiceId(svc.id)}
                                className="sr-only"
                              />
                              {checked && <Check className="w-3.5 h-3.5" />}
                              {svc.name}
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleUpdate(emp)}
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:brightness-110 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                      <span className="relative z-10">Guardar</span>
                    </button>
                    <button
                      onClick={resetForm}
                      className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        {employees.length === 0 && (
          <div className={`${CARD} p-12 text-center`}>
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay profesionales configurados</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Tab: Horarios ───────────────────────────────────────────────────

type ScheduleBlock = {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
  breakStart: string | null
  breakEnd: string | null
}

type ScheduleException = {
  id: string
  date: string
  available: boolean
  startTime: string | null
  endTime: string | null
  reason: string | null
}

// ─── Tab: Métricas ──────────────────────────────────────────────────

const SOURCE_LABELS: Record<string, string> = {
  web: "Web",
  widget: "Widget",
  chatbot: "Chatbot",
  whatsapp: "WhatsApp",
  manual: "Manual",
}

const SOURCE_COLORS: Record<string, string> = {
  web: "#3B82F6",
  widget: "#8B5CF6",
  chatbot: "#10B981",
  whatsapp: "#22C55E",
  manual: "#F59E0B",
}

function TabMetricas({ token }: { token: string }) {
  const [appointments, setAppointments] = useState<ManagedAppointment[]>([])
  const [services, setServices] = useState<(BookingService & { active: boolean; sortOrder: number })[]>([])
  const [employees, setEmployees] = useState<(BookingEmployee & { active: boolean; serviceIds: string[] })[]>([])
  const [loading, setLoading] = useState(true)

  const now = useMemo(() => new Date(), [])
  const monthStart = useMemo(() => {
    const d = new Date(now.getFullYear(), now.getMonth(), 1)
    return toDateISO(d)
  }, [now])
  const monthEnd = useMemo(() => {
    const d = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return toDateISO(d)
  }, [now])

  const monthLabel = useMemo(() => {
    return now.toLocaleDateString("es-ES", { month: "long", year: "numeric" })
  }, [now])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch all pages of appointments for the month
      let allAppts: ManagedAppointment[] = []
      let page = 1
      let hasMore = true
      while (hasMore) {
        const res = await fetchAppointments(token, { from: monthStart, to: monthEnd, page })
        allAppts = [...allAppts, ...res.appointments]
        // If we got fewer than the limit, we've fetched all pages
        hasMore = res.appointments.length >= res.limit
        page++
      }
      const [svcRes, empRes] = await Promise.all([
        fetchOwnerServices(token),
        fetchOwnerEmployees(token),
      ])
      setAppointments(allAppts)
      setServices(svcRes.services)
      setEmployees(empRes.employees)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [token, monthStart, monthEnd])

  useEffect(() => { load() }, [load])

  // Build a price map from services
  const priceMap = useMemo(() => {
    const map: Record<string, number> = {}
    for (const svc of services) {
      map[svc.id] = svc.price ? parseFloat(svc.price) : 0
    }
    return map
  }, [services])

  // ─── Summary stats ───────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = appointments.length
    const confirmed = appointments.filter(a => a.status === "confirmed" || a.status === "completed").length
    const cancelled = appointments.filter(a => a.status === "cancelled").length
    const cancelRate = total > 0 ? ((cancelled / total) * 100).toFixed(1) : "0"
    const revenue = appointments
      .filter(a => a.status === "confirmed" || a.status === "completed")
      .reduce((sum, a) => sum + (priceMap[a.serviceId] || 0), 0)
    return { total, confirmed, cancelRate, revenue }
  }, [appointments, priceMap])

  // ─── Appointments by status ──────────────────────────────────────
  const statusBreakdown = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const a of appointments) {
      counts[a.status] = (counts[a.status] || 0) + 1
    }
    return Object.entries(STATUS_MAP).map(([key, info]) => ({
      key,
      label: info.label,
      color: info.color,
      bg: info.bg,
      count: counts[key] || 0,
    }))
  }, [appointments])

  const maxStatusCount = useMemo(
    () => Math.max(...statusBreakdown.map(s => s.count), 1),
    [statusBreakdown]
  )

  // ─── Popular services ────────────────────────────────────────────
  const popularServices = useMemo(() => {
    const map: Record<string, { name: string; count: number; revenue: number }> = {}
    for (const a of appointments) {
      const name = a.serviceName || "Sin servicio"
      if (!map[a.serviceId]) {
        map[a.serviceId] = { name, count: 0, revenue: 0 }
      }
      map[a.serviceId].count++
      if (a.status === "confirmed" || a.status === "completed") {
        map[a.serviceId].revenue += priceMap[a.serviceId] || 0
      }
    }
    return Object.values(map).sort((a, b) => b.count - a.count)
  }, [appointments, priceMap])

  // ─── Appointments by source ──────────────────────────────────────
  const sourceBreakdown = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const a of appointments) {
      const src = a.source || "manual"
      counts[src] = (counts[src] || 0) + 1
    }
    const total = appointments.length || 1
    return Object.entries(counts)
      .map(([key, count]) => ({
        key,
        label: SOURCE_LABELS[key] || key,
        color: SOURCE_COLORS[key] || "#6B7280",
        count,
        pct: ((count / total) * 100).toFixed(1),
      }))
      .sort((a, b) => b.count - a.count)
  }, [appointments])

  // ─── Employee performance ────────────────────────────────────────
  const employeePerformance = useMemo(() => {
    const map: Record<string, { name: string; total: number; completed: number; cancelled: number }> = {}
    for (const a of appointments) {
      const empId = a.employeeId
      if (!empId) continue
      if (!map[empId]) {
        const emp = employees.find(e => e.id === empId)
        map[empId] = { name: emp?.name || a.employeeName || "Desconocido", total: 0, completed: 0, cancelled: 0 }
      }
      map[empId].total++
      if (a.status === "completed") map[empId].completed++
      if (a.status === "cancelled") map[empId].cancelled++
    }
    return Object.values(map).sort((a, b) => b.total - a.total)
  }, [appointments, employees])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-secondary dark:text-gray-100 font-display">Métricas</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 capitalize">{monthLabel}</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-primary rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className={`${CARD} p-4 text-center`}
        >
          <p className="text-3xl font-bold text-secondary dark:text-gray-100">{stats.total}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total citas</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className={`${CARD} p-4 text-center`}
        >
          <p className="text-3xl font-bold" style={{ color: "#3B82F6" }}>{stats.confirmed}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Confirmadas</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`${CARD} p-4 text-center`}
        >
          <p className="text-3xl font-bold" style={{ color: "#EF4444" }}>{stats.cancelRate}%</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tasa cancelación</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={`${CARD} p-4 text-center`}
        >
          <p className="text-3xl font-bold text-primary">{stats.revenue.toFixed(0)}&euro;</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Ingresos estimados</p>
        </motion.div>
      </div>

      {/* Appointments by status */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`${CARD} p-5`}
      >
        <h3 className="text-lg font-semibold text-secondary dark:text-gray-100 font-display mb-4">Citas por estado</h3>
        <div className="space-y-3">
          {statusBreakdown.map((s) => (
            <div key={s.key} className="flex items-center gap-3">
              <span className="text-sm text-gray-600 w-24 flex-shrink-0">{s.label}</span>
              <div className="flex-1 h-7 bg-gray-50 rounded-full overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(s.count / maxStatusCount) * 100}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: s.color + "30", minWidth: s.count > 0 ? "8px" : "0" }}
                />
                {s.count > 0 && (
                  <span
                    className="absolute inset-y-0 flex items-center text-xs font-semibold pl-3"
                    style={{ color: s.color }}
                  >
                    {s.count}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Two-column layout for services + sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Popular services */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className={`${CARD} p-5`}
        >
          <h3 className="text-lg font-semibold text-secondary dark:text-gray-100 font-display mb-4">Servicios populares</h3>
          {popularServices.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Sin datos este mes</p>
          ) : (
            <div className="space-y-0">
              {/* Table header */}
              <div className="flex items-center text-xs text-gray-400 uppercase tracking-wide pb-2 border-b border-gray-50">
                <span className="flex-1">Servicio</span>
                <span className="w-16 text-center">Citas</span>
                <span className="w-20 text-right">Ingresos</span>
              </div>
              {popularServices.map((svc, i) => (
                <div
                  key={i}
                  className="flex items-center py-2.5 border-b border-gray-50 last:border-0"
                >
                  <span className="flex-1 text-sm text-gray-700 truncate pr-2">{svc.name}</span>
                  <span className="w-16 text-center text-sm font-semibold text-secondary">{svc.count}</span>
                  <span className="w-20 text-right text-sm font-medium text-primary">{svc.revenue.toFixed(0)}&euro;</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Appointments by source */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`${CARD} p-5`}
        >
          <h3 className="text-lg font-semibold text-secondary dark:text-gray-100 font-display mb-4">Origen de citas</h3>
          {sourceBreakdown.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Sin datos este mes</p>
          ) : (
            <div className="space-y-3">
              {sourceBreakdown.map((src) => (
                <div key={src.key} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 w-24 flex-shrink-0">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: src.color }} />
                    <span className="text-sm text-gray-700">{src.label}</span>
                  </div>
                  <div className="flex-1">
                    <div className="h-6 bg-gray-50 rounded-full overflow-hidden relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${src.pct}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: src.color + "25", minWidth: "8px" }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm font-semibold text-secondary">{src.count}</span>
                    <span className="text-xs text-gray-400">({src.pct}%)</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Employee performance */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className={`${CARD} p-5`}
      >
        <h3 className="text-lg font-semibold text-secondary dark:text-gray-100 font-display mb-4">Rendimiento por profesional</h3>
        {employeePerformance.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">Sin datos este mes</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-50">
                  <th className="text-left py-2 font-medium">Profesional</th>
                  <th className="text-center py-2 font-medium">Total</th>
                  <th className="text-center py-2 font-medium">Completadas</th>
                  <th className="text-center py-2 font-medium">Canceladas</th>
                </tr>
              </thead>
              <tbody>
                {employeePerformance.map((emp, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0">
                    <td className="py-2.5 text-gray-700 font-medium">{emp.name}</td>
                    <td className="py-2.5 text-center font-semibold text-secondary">{emp.total}</td>
                    <td className="py-2.5 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold" style={{ color: "#22C55E", backgroundColor: "#22C55E15" }}>
                        {emp.completed}
                      </span>
                    </td>
                    <td className="py-2.5 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold" style={{ color: "#EF4444", backgroundColor: "#EF444415" }}>
                        {emp.cancelled}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  )
}

// ─── Tab: Horarios ──────────────────────────────────────────────────

function TabHorarios({ token }: { token: string }) {
  const [employees, setEmployees] = useState<(BookingEmployee & { active: boolean; serviceIds: string[] })[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<string>("")
  const [schedules, setSchedules] = useState<ScheduleBlock[]>([])
  const [exceptions, setExceptions] = useState<ScheduleException[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // New schedule form
  const [addDay, setAddDay] = useState<number | null>(null)
  const [addStart, setAddStart] = useState("09:00")
  const [addEnd, setAddEnd] = useState("14:00")

  // New exception form
  const [showExceptionForm, setShowExceptionForm] = useState(false)
  const [excDate, setExcDate] = useState("")
  const [excReason, setExcReason] = useState("")

  const loadEmployees = useCallback(async () => {
    try {
      const res = await fetchOwnerEmployees(token)
      setEmployees(res.employees)
      if (res.employees.length > 0 && !selectedEmployee) {
        setSelectedEmployee(res.employees[0].id)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [token, selectedEmployee])

  useEffect(() => { loadEmployees() }, [loadEmployees])

  const loadSchedules = useCallback(async () => {
    if (!selectedEmployee) return
    try {
      const [schedRes, excRes] = await Promise.all([
        fetchSchedules(token, selectedEmployee),
        fetchExceptions(token, selectedEmployee),
      ])
      setSchedules(schedRes.schedules)
      setExceptions(excRes.exceptions)
    } catch {
      // ignore
    }
  }, [token, selectedEmployee])

  useEffect(() => { loadSchedules() }, [loadSchedules])

  async function handleAddSchedule(dayOfWeek: number) {
    setSaving(true)
    try {
      await manageSchedule(token, {
        action: "create",
        employeeId: selectedEmployee,
        dayOfWeek,
        startTime: addStart,
        endTime: addEnd,
      })
      setAddDay(null)
      setAddStart("09:00")
      setAddEnd("14:00")
      await loadSchedules()
    } catch {
      // ignore
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteSchedule(id: string) {
    try {
      await manageSchedule(token, { action: "delete", id })
      await loadSchedules()
    } catch {
      // ignore
    }
  }

  async function handleAddException() {
    if (!excDate) return
    setSaving(true)
    try {
      await manageException(token, {
        action: "create",
        employeeId: selectedEmployee,
        date: excDate,
        available: false,
        reason: excReason || null,
      })
      setShowExceptionForm(false)
      setExcDate("")
      setExcReason("")
      await loadSchedules()
    } catch {
      // ignore
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteException(id: string) {
    try {
      await manageException(token, { action: "delete", id })
      await loadSchedules()
    } catch {
      // ignore
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (employees.length === 0) {
    return (
      <div className={`${CARD} p-12 text-center`}>
        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No hay profesionales configurados</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-secondary dark:text-gray-100 font-display">Horarios</h2>
        <select
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          className="px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all bg-white dark:bg-gray-700"
        >
          {employees.map(emp => (
            <option key={emp.id} value={emp.id}>{emp.name}{emp.role ? ` — ${emp.role}` : ""}</option>
          ))}
        </select>
      </div>

      {/* 7-day grid */}
      <div className="space-y-3">
        {DAY_NAMES.map((dayName, dayIndex) => {
          const daySchedules = schedules.filter(s => s.dayOfWeek === dayIndex)
          return (
            <div key={dayIndex} className={`${CARD} p-4 sm:p-5`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-secondary dark:text-gray-100">{dayName}</h3>
                <button
                  onClick={() => setAddDay(addDay === dayIndex ? null : dayIndex)}
                  className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary-700 transition-colors font-medium"
                >
                  <Plus className="w-3.5 h-3.5" /> Añadir franja
                </button>
              </div>

              {daySchedules.length === 0 && addDay !== dayIndex && (
                <p className="text-sm text-gray-400 italic">Sin horario</p>
              )}

              <div className="space-y-2">
                {daySchedules.map((block) => (
                  <div key={block.id} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg">
                      {block.startTime} - {block.endTime}
                    </span>
                    <button
                      onClick={() => handleDeleteSchedule(block.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add schedule form */}
              <AnimatePresence>
                {addDay === dayIndex && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 pt-3 border-t border-gray-100 overflow-hidden"
                  >
                    <div className="flex items-center gap-3 flex-wrap">
                      <input
                        type="time"
                        value={addStart}
                        onChange={(e) => setAddStart(e.target.value)}
                        className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
                      />
                      <span className="text-gray-400">-</span>
                      <input
                        type="time"
                        value={addEnd}
                        onChange={(e) => setAddEnd(e.target.value)}
                        className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
                      />
                      <button
                        onClick={() => handleAddSchedule(dayIndex)}
                        disabled={saving}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
                      >
                        {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                        <span className="relative z-10">Guardar</span>
                      </button>
                      <button
                        onClick={() => setAddDay(null)}
                        className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {/* Exceptions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-secondary dark:text-gray-100 font-display">Excepciones</h3>
          <button
            onClick={() => setShowExceptionForm(!showExceptionForm)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
          >
            <Plus className="w-4 h-4" /> Añadir vacaciones
          </button>
        </div>

        <AnimatePresence>
          {showExceptionForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`${CARD} p-5 space-y-4 overflow-hidden`}
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="date"
                  value={excDate}
                  onChange={(e) => setExcDate(e.target.value)}
                  className="px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
                />
                <input
                  type="text"
                  placeholder="Motivo (opcional)"
                  value={excReason}
                  onChange={(e) => setExcReason(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
                />
                <button
                  onClick={handleAddException}
                  disabled={saving || !excDate}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:brightness-110 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                  <span className="relative z-10">Añadir</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {exceptions.length === 0 ? (
          <div className={`${CARD} p-8 text-center`}>
            <p className="text-gray-400 text-sm">No hay excepciones configuradas</p>
          </div>
        ) : (
          <div className="space-y-2">
            {exceptions.map((exc) => (
              <div key={exc.id} className={`${CARD} p-4 flex items-center justify-between`}>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-secondary dark:text-gray-100">
                    {new Date(exc.date + "T00:00:00").toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  {exc.reason && <span className="text-sm text-gray-500">{exc.reason}</span>}
                </div>
                <button
                  onClick={() => handleDeleteException(exc.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Tab: Configuración ──────────────────────────────────────────────

function TabConfig({ token }: { token: string }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [enabled, setEnabled] = useState(true)
  const [slotDuration, setSlotDuration] = useState(30)
  const [maxAdvanceDays, setMaxAdvanceDays] = useState(30)
  const [minAdvanceHours, setMinAdvanceHours] = useState(2)
  const [bufferMinutes, setBufferMinutes] = useState(0)
  const [autoConfirm, setAutoConfirm] = useState(false)
  const [notifEmail, setNotifEmail] = useState("")
  const [telegramChatId, setTelegramChatId] = useState("")
  const [cancellationPolicy, setCancellationPolicy] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const cfg = await fetchOwnerConfig(token)
      if (cfg) {
        setEnabled(cfg.enabled !== false)
        setSlotDuration(Number(cfg.slotDurationMin) || 30)
        setMaxAdvanceDays(Number(cfg.maxAdvanceDays) || 30)
        setMinAdvanceHours(Number(cfg.minAdvanceHours) || 2)
        setBufferMinutes(Number(cfg.bufferMinutes) || 0)
        setAutoConfirm(cfg.autoConfirm === true)
        setNotifEmail((cfg.notifEmail as string) || "")
        setTelegramChatId((cfg.telegramChatId as string) || "")
        setCancellationPolicy((cfg.cancellationPolicy as string) || "")
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { load() }, [load])

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    try {
      await updateOwnerConfig(token, {
        enabled,
        slotDurationMin: slotDuration,
        maxAdvanceDays,
        minAdvanceHours,
        bufferMinutes,
        autoConfirm,
        notifEmail: notifEmail || null,
        telegramChatId: telegramChatId || null,
        cancellationPolicy: cancellationPolicy || null,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      // ignore
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-secondary dark:text-gray-100 font-display">Configuración</h2>

      <div className={`${CARD} p-5 sm:p-6 space-y-6`}>
        {/* Enabled toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-secondary dark:text-gray-100">Reservas habilitadas</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Permitir que los clientes reserven online</p>
          </div>
          <button
            onClick={() => setEnabled(!enabled)}
            className={`relative w-12 h-6 rounded-full transition-colors ${enabled ? "bg-green-400" : "bg-gray-300"}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${enabled ? "translate-x-6" : "translate-x-0"}`}
            />
          </button>
        </div>

        <hr className="border-black/[0.04] dark:border-white/[0.06]" />

        {/* Number fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-secondary dark:text-gray-200 mb-1.5">Duración slot (min)</label>
            <input
              type="number"
              min={5}
              max={120}
              value={slotDuration}
              onChange={(e) => setSlotDuration(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary dark:text-gray-200 mb-1.5">Días máx anticipación</label>
            <input
              type="number"
              min={1}
              max={365}
              value={maxAdvanceDays}
              onChange={(e) => setMaxAdvanceDays(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary dark:text-gray-200 mb-1.5">Horas mín anticipación</label>
            <input
              type="number"
              min={0}
              max={72}
              value={minAdvanceHours}
              onChange={(e) => setMinAdvanceHours(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary dark:text-gray-200 mb-1.5">Buffer entre citas (min)</label>
            <input
              type="number"
              min={0}
              max={60}
              value={bufferMinutes}
              onChange={(e) => setBufferMinutes(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
            />
          </div>
        </div>

        <hr className="border-black/[0.04] dark:border-white/[0.06]" />

        {/* Auto-confirm toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-secondary dark:text-gray-100">Auto-confirmar</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Confirmar citas automáticamente al reservar</p>
          </div>
          <button
            onClick={() => setAutoConfirm(!autoConfirm)}
            className={`relative w-12 h-6 rounded-full transition-colors ${autoConfirm ? "bg-green-400" : "bg-gray-300"}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${autoConfirm ? "translate-x-6" : "translate-x-0"}`}
            />
          </button>
        </div>

        <hr className="border-black/[0.04] dark:border-white/[0.06]" />

        {/* Notification fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-secondary dark:text-gray-200 mb-1.5">Email notificaciones</label>
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              value={notifEmail}
              onChange={(e) => setNotifEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary dark:text-gray-200 mb-1.5">Telegram Chat ID</label>
            <input
              type="text"
              placeholder="123456789"
              value={telegramChatId}
              onChange={(e) => setTelegramChatId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary dark:text-gray-200 mb-1.5">Política de cancelación</label>
          <textarea
            rows={3}
            placeholder="Escribe la política de cancelación..."
            value={cancellationPolicy}
            onChange={(e) => setCancellationPolicy(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all resize-none"
          />
        </div>

        {/* Save button */}
        <div className="flex items-center gap-4 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary !py-3 !px-8"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin relative z-10" />
            ) : (
              <span className="relative z-10">Guardar</span>
            )}
          </button>
          {saved && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-1.5 text-green-600 text-sm font-medium"
            >
              <Check className="w-4 h-4" /> Guardado
            </motion.span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Tab: Mensajes ──────────────────────────────────────────────────

function TabMensajes({ token }: { token: string }) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<WhatsAppMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const loadConversations = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchConversations(token)
      setConversations(res.conversations || [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { loadConversations() }, [loadConversations])

  async function openConversation(phone: string) {
    setSelectedPhone(phone)
    setLoadingMessages(true)
    try {
      const res = await fetchMessages(token, phone, 100)
      // Reverse to show oldest first (API returns newest first)
      setMessages((res.messages || []).reverse())
    } catch {
      setMessages([])
    } finally {
      setLoadingMessages(false)
    }
  }

  // Scroll to bottom when messages load
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  function formatMessageTime(iso: string): string {
    const d = new Date(iso)
    const now = new Date()
    const isToday = d.toDateString() === now.toDateString()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const isYesterday = d.toDateString() === yesterday.toDateString()

    const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
    if (isToday) return time
    if (isYesterday) return `Ayer ${time}`
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")} ${time}`
  }

  // Conversation detail view
  if (selectedPhone) {
    return (
      <div className="flex flex-col h-[calc(100vh-180px)] md:h-[calc(100vh-140px)]">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => { setSelectedPhone(null); setMessages([]) }}
            className={BTN_SECONDARY}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Volver</span>
          </button>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5 text-green-600" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-secondary dark:text-gray-100 truncate">{selectedPhone}</p>
              <p className="text-xs text-gray-400">{messages.length} mensajes</p>
            </div>
          </div>
          <a
            href={`https://wa.me/${selectedPhone.replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className={BTN_PRIMARY + " !px-3 !py-2"}
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
        </div>

        {/* Messages */}
        <div className={`${CARD} flex-1 overflow-y-auto p-4`}>
          {loadingMessages ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                <MessageCircle className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-gray-400 text-sm">No hay mensajes con este contacto</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => {
                const isOutbound = msg.direction === "outbound"
                return (
                  <div key={msg.id} className={`flex ${isOutbound ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 ${
                        isOutbound
                          ? "bg-primary text-white rounded-br-md"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-md"
                      }`}
                    >
                      {msg.messageType && (
                        <p className={`text-[10px] font-medium mb-1 ${isOutbound ? "text-white/60" : "text-gray-400"}`}>
                          {msg.messageType}
                        </p>
                      )}
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.content || "(sin contenido)"}</p>
                      <p className={`text-[10px] mt-1 text-right ${isOutbound ? "text-white/50" : "text-gray-400"}`}>
                        {formatMessageTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Read-only notice */}
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-400">Solo lectura — los mensajes se envían desde el sistema automático</p>
        </div>
      </div>
    )
  }

  // Conversation list view
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-secondary dark:text-gray-100 font-display">Mensajes</h2>
        <button onClick={loadConversations} className={BTN_SECONDARY}>
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">Actualizar</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : conversations.length === 0 ? (
        <div className={`${CARD} p-12 text-center`}>
          <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-500 text-lg font-medium">Sin conversaciones</p>
          <p className="text-gray-400 text-sm mt-1">Los mensajes de WhatsApp aparecerán aquí</p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => (
            <motion.button
              key={conv.phone}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => openConversation(conv.phone)}
              className={`${CARD} p-4 w-full text-left hover:shadow-md transition-all active:scale-[0.99]`}
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-secondary dark:text-gray-100 text-sm truncate">{conv.phone}</p>
                    <span className="text-[11px] text-gray-400 flex-shrink-0">
                      {formatMessageTime(conv.lastAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <p className="text-xs text-gray-500 truncate">
                      {conv.lastDirection === "outbound" ? "Tú: " : ""}
                      {conv.lastMessage || "(sin contenido)"}
                    </p>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500 flex-shrink-0">
                      {conv.messageCount}
                    </span>
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Admin Page ─────────────────────────────────────────────────

export default function AdminPage() {
  const clinic = useClinic()
  const [token, setToken] = useState<string | null>(null)
  const [authState, setAuthState] = useState<"loading" | "valid" | "invalid">("loading")
  const [activeTab, setActiveTab] = useState<TabId>("hoy")
  const { theme, toggle: toggleTheme } = useTheme()
  const { canInstall, install: installPWA, dismiss: dismissPWA } = usePWA()

  const [showMoreMenu, setShowMoreMenu] = useState(false)

  // Authentication — read from URL params OR localStorage (PWA support)
  useEffect(() => {
    const urlToken = new URLSearchParams(window.location.search).get("token")
    const storedToken = localStorage.getItem("admin-token")
    const tokenToValidate = urlToken || storedToken

    if (!tokenToValidate) {
      setAuthState("invalid")
      return
    }

    validateOwnerToken(tokenToValidate).then((res) => {
      if (res.valid) {
        setToken(tokenToValidate)
        setAuthState("valid")
        // Persist token for PWA
        localStorage.setItem("admin-token", tokenToValidate)
        // Clean token from URL for security
        if (urlToken) {
          window.history.replaceState({}, "", window.location.pathname)
        }
      } else {
        localStorage.removeItem("admin-token")
        setAuthState("invalid")
      }
    }).catch(() => {
      // If offline and we have a stored token, use it optimistically
      if (storedToken && !navigator.onLine) {
        setToken(storedToken)
        setAuthState("valid")
      } else {
        localStorage.removeItem("admin-token")
        setAuthState("invalid")
      }
    })
  }, [])

  function handleLogout() {
    localStorage.removeItem("admin-token")
    setToken(null)
    setAuthState("invalid")
    window.location.href = "/"
  }

  // ─── Loading screen ───────────────────────────────────────────────

  if (authState === "loading") {
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  // ─── Invalid token screen ─────────────────────────────────────────

  if (authState === "invalid" || !token) {
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto px-6">
          <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-secondary dark:text-gray-100 font-display mb-2">Token inválido</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            El enlace de acceso no es válido o ha expirado. Contacta con soporte para obtener uno nuevo.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 text-primary hover:text-primary-700 transition-colors text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" /> Volver al inicio
          </a>
        </div>
      </div>
    )
  }

  // ─── Authenticated dashboard ───────────────────────────────────────

  const activeNavItem = NAV_ITEMS.find(n => n.id === activeTab)!

  return (
    <div className="fixed inset-0 z-50 bg-neutral dark:bg-gray-900">
      {/* PWA install banner */}
      {canInstall && (
        <div className="bg-primary text-white px-4 py-2.5 flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 flex-shrink-0" />
            <span>Instala la app en tu dispositivo para acceso rápido</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={installPWA}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium transition-colors"
            >
              Instalar
            </button>
            <button
              onClick={dismissPWA}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Desktop sidebar + content grid */}
      <div className={`grid grid-cols-1 md:grid-cols-[240px_1fr] ${canInstall ? "h-[calc(100%-44px)]" : "h-full"}`}>
        {/* Desktop sidebar */}
        <aside className="hidden md:flex flex-col bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 text-white">
          {/* Clinic name */}
          <div className="p-5 border-b border-white/[0.06]">
            <h1 className="text-base font-bold font-display truncate">{clinic.name}</h1>
            <p className="text-xs text-white/40 mt-0.5">Panel de administración</p>
          </div>

          {/* Nav items */}
          <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all ${
                    isActive
                      ? "bg-white/[0.12] text-white shadow-sm"
                      : "text-white/60 hover:bg-white/[0.06] hover:text-white/90"
                  }`}
                >
                  <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? "text-primary" : ""}`} />
                  {item.label}
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                </button>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/[0.06] space-y-2">
            <a
              href="/"
              className="flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Volver a la web
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs text-white/40 hover:text-red-400 transition-colors w-full"
            >
              <LogOut className="w-3.5 h-3.5" /> Cerrar sesión
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex flex-col min-h-0">
          {/* Top header bar — glass effect */}
          <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-black/[0.04] dark:border-white/[0.06] px-4 sm:px-6 py-4 flex items-center justify-between flex-shrink-0 sticky top-0 z-30">
            <h2 className="text-lg font-bold text-secondary dark:text-gray-100 font-display md:block hidden">{activeNavItem.label}</h2>
            {/* Mobile: show clinic name */}
            <h2 className="text-lg font-bold text-secondary dark:text-gray-100 font-display md:hidden truncate">{clinic.name}</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 hidden sm:block">
                {formatDateSpanish(new Date())}
              </span>
              {/* Dark mode toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              >
                {theme === "dark" ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
              </button>
              {/* Mobile logout */}
              <button
                onClick={handleLogout}
                className="md:hidden p-2 rounded-xl text-gray-400 hover:text-red-500 transition-colors"
                aria-label="Cerrar sesión"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          </header>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 md:pb-6 dark:text-gray-100">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "hoy" && <TabHoy token={token} />}
                {activeTab === "calendario" && <TabCalendario token={token} />}
                {activeTab === "citas" && <TabCitas token={token} />}
                {activeTab === "clientes" && <TabClientes token={token} />}
                {activeTab === "servicios" && <TabServicios token={token} />}
                {activeTab === "equipo" && <TabEquipo token={token} />}
                {activeTab === "metricas" && <TabMetricas token={token} />}
                {activeTab === "horarios" && <TabHorarios token={token} />}
                {activeTab === "config" && <TabConfig token={token} />}
                {activeTab === "mensajes" && <TabMensajes token={token} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile bottom tab bar — 4 primary + More */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white dark:bg-gray-900 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-around py-1.5 pb-[env(safe-area-inset-bottom)]">
          {PRIMARY_TABS.map((tabId) => {
            const item = NAV_ITEMS.find(n => n.id === tabId)!
            const Icon = item.icon
            const isActive = activeTab === tabId
            return (
              <button
                key={tabId}
                onClick={() => { setActiveTab(tabId); setShowMoreMenu(false) }}
                className="flex flex-col items-center gap-0.5 min-w-[56px] py-1.5 transition-colors"
              >
                <div className={`p-1.5 rounded-xl transition-colors ${isActive ? "bg-primary/10" : ""}`}>
                  <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-gray-400 dark:text-gray-500"}`} />
                </div>
                <span className={`text-[10px] font-medium ${isActive ? "text-primary" : "text-gray-400 dark:text-gray-500"}`}>{item.label}</span>
              </button>
            )
          })}
          {/* More button */}
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="flex flex-col items-center gap-0.5 min-w-[56px] py-1.5 transition-colors"
          >
            <div className={`p-1.5 rounded-xl transition-colors ${SECONDARY_TABS.includes(activeTab) || showMoreMenu ? "bg-primary/10" : ""}`}>
              <MoreHorizontal className={`w-5 h-5 ${SECONDARY_TABS.includes(activeTab) || showMoreMenu ? "text-primary" : "text-gray-400 dark:text-gray-500"}`} />
            </div>
            <span className={`text-[10px] font-medium ${SECONDARY_TABS.includes(activeTab) || showMoreMenu ? "text-primary" : "text-gray-400 dark:text-gray-500"}`}>Más</span>
          </button>
        </div>
      </nav>

      {/* More menu bottom sheet */}
      <AnimatePresence>
        {showMoreMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-40 bg-black/30"
            onClick={() => setShowMoreMenu(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute bottom-[calc(56px+env(safe-area-inset-bottom))] inset-x-0 bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl p-5 pb-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-gray-700 mx-auto mb-5" />
              <div className="grid grid-cols-4 gap-3">
                {SECONDARY_TABS.map((tabId) => {
                  const item = NAV_ITEMS.find(n => n.id === tabId)!
                  const Icon = item.icon
                  const isActive = activeTab === tabId
                  return (
                    <button
                      key={tabId}
                      onClick={() => { setActiveTab(tabId); setShowMoreMenu(false) }}
                      className="flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-colors active:bg-gray-50 dark:active:bg-gray-800"
                    >
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${isActive ? "bg-primary/10" : "bg-gray-50 dark:bg-gray-800"}`}>
                        <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-gray-500 dark:text-gray-400"}`} />
                      </div>
                      <span className={`text-[11px] font-medium ${isActive ? "text-primary" : "text-gray-600 dark:text-gray-400"}`}>{item.label}</span>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
