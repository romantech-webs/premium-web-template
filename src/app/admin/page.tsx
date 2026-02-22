"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
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
  fetchSchedules,
  manageSchedule,
  fetchExceptions,
  manageException,
} from "@/lib/booking-api"
import type {
  ManagedAppointment,
  BookingService,
  BookingEmployee,
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

type TabId = "hoy" | "citas" | "servicios" | "horarios" | "config"

interface NavItem {
  id: TabId
  label: string
  icon: typeof CalendarDays
}

const NAV_ITEMS: NavItem[] = [
  { id: "hoy",       label: "Hoy",       icon: CalendarDays },
  { id: "citas",     label: "Citas",     icon: List },
  { id: "servicios", label: "Servicios", icon: Briefcase },
  { id: "horarios",  label: "Horarios",  icon: Clock },
  { id: "config",    label: "Config",    icon: Settings },
]

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

// ─── Status Badge ────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const info = STATUS_MAP[status] || { label: status, color: "#6B7280", bg: "#6B728015" }
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ color: info.color, backgroundColor: info.bg }}
    >
      {info.label}
    </span>
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

  if (appt.status === "pending") {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => handleAction("confirmed")}
          disabled={!!loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          {spinner("confirmed")} Confirmar
        </button>
        <button
          onClick={() => handleAction("cancelled")}
          disabled={!!loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-red-500 text-xs font-medium hover:text-red-700 transition-colors disabled:opacity-50"
        >
          {spinner("cancelled")} Cancelar
        </button>
      </div>
    )
  }

  if (appt.status === "confirmed") {
    return (
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
        <button
          onClick={() => handleAction("cancelled")}
          disabled={!!loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-red-500 text-xs font-medium hover:text-red-700 transition-colors disabled:opacity-50"
        >
          {spinner("cancelled")} Cancelar
        </button>
      </div>
    )
  }

  return null
}

// ─── Tab: Hoy ────────────────────────────────────────────────────────

function TabHoy({ token }: { token: string }) {
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
        <h2 className="text-2xl font-bold text-secondary font-display capitalize">
          Hoy &mdash; {formatDateSpanish(today)}
        </h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-3xl font-bold text-secondary">{stats.total}</p>
          <p className="text-sm text-gray-500 mt-1">citas hoy</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-3xl font-bold" style={{ color: "#EAB308" }}>{stats.pending}</p>
          <p className="text-sm text-gray-500 mt-1">pendientes</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-3xl font-bold" style={{ color: "#3B82F6" }}>{stats.confirmed}</p>
          <p className="text-sm text-gray-500 mt-1">confirmadas</p>
        </div>
      </div>

      {/* Timeline */}
      {appointments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
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
              className="bg-white rounded-xl border border-gray-100 p-4 md:p-5"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
                {/* Time */}
                <div className="flex items-center gap-3 md:min-w-[60px]">
                  <span className="text-lg font-bold text-secondary font-display">
                    {formatTime(appt.scheduledAt)}
                  </span>
                </div>

                {/* Employee */}
                {appt.employeeName && (
                  <div className="flex items-center gap-2 md:min-w-[140px]">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: "var(--color-primary)" }} />
                    <span className="text-sm text-gray-700">{appt.employeeName}</span>
                  </div>
                )}

                {/* Service */}
                <div className="md:min-w-[150px]">
                  <span className="text-sm font-medium text-gray-800">{appt.serviceName || "Sin servicio"}</span>
                </div>

                {/* Client */}
                <div className="flex items-center gap-2 md:min-w-[160px]">
                  <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{appt.customerName}</span>
                  {appt.customerPhone && (
                    <a href={`tel:${appt.customerPhone}`} className="text-primary hover:text-primary-700 transition-colors">
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {/* Status */}
                <div className="md:min-w-[100px]">
                  <StatusBadge status={appt.status} />
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

// ─── Tab: Citas ──────────────────────────────────────────────────────

function TabCitas({ token }: { token: string }) {
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
        <h2 className="text-2xl font-bold text-secondary font-display">Citas</h2>
        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-secondary border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Exportar CSV</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); handleFilterChange() }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
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
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Desde"
          />
          <input
            type="date"
            value={filterTo}
            onChange={(e) => { setFilterTo(e.target.value); handleFilterChange() }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Hasta"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No hay citas con estos filtros</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Fecha/Hora</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Profesional</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Servicio</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Cliente</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Teléfono</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Estado</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Código</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt) => (
                  <tr key={appt.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
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
                    <td className="px-4 py-3"><StatusBadge status={appt.status} /></td>
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
                className="bg-white rounded-xl border border-gray-100 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-secondary">{formatShortDate(appt.scheduledAt)}</span>
                  <StatusBadge status={appt.status} />
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
                  <p className="text-gray-400 text-xs font-mono">Código: {appt.confirmationCode}</p>
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
              className="inline-flex items-center gap-1 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>
            <span className="text-sm text-gray-500">Página {page}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={!hasMore}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Siguiente <ChevronRight className="w-4 h-4" />
            </button>
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
        <h2 className="text-2xl font-bold text-secondary font-display">Servicios</h2>
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
            className="bg-white rounded-xl border border-gray-100 p-5 space-y-4 overflow-hidden"
          >
            <h3 className="font-semibold text-secondary">Nuevo servicio</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Nombre del servicio"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <select
                value={formDuration}
                onChange={(e) => setFormDuration(Number(e.target.value))}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
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
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCreate}
                disabled={saving || !formName.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
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
          <div key={svc.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 sm:p-5">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-secondary truncate">{svc.name}</p>
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
                  className="border-t border-gray-100 p-4 sm:p-5 space-y-4 bg-gray-50/50 overflow-hidden"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Nombre"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <select
                      value={formDuration}
                      onChange={(e) => setFormDuration(Number(e.target.value))}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
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
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <input
                      type="text"
                      placeholder="Descripción"
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleUpdate(svc)}
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
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
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay servicios configurados</p>
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
      <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No hay profesionales configurados</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-secondary font-display">Horarios</h2>
        <select
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
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
            <div key={dayIndex} className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-secondary">{dayName}</h3>
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
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                      <span className="text-gray-400">-</span>
                      <input
                        type="time"
                        value={addEnd}
                        onChange={(e) => setAddEnd(e.target.value)}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
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
          <h3 className="text-lg font-bold text-secondary font-display">Excepciones</h3>
          <button
            onClick={() => setShowExceptionForm(!showExceptionForm)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-secondary border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
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
              className="bg-white rounded-xl border border-gray-100 p-5 space-y-4 overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="date"
                  value={excDate}
                  onChange={(e) => setExcDate(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <input
                  type="text"
                  placeholder="Motivo (opcional)"
                  value={excReason}
                  onChange={(e) => setExcReason(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  onClick={handleAddException}
                  disabled={saving || !excDate}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                  <span className="relative z-10">Añadir</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {exceptions.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
            <p className="text-gray-400 text-sm">No hay excepciones configuradas</p>
          </div>
        ) : (
          <div className="space-y-2">
            {exceptions.map((exc) => (
              <div key={exc.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-secondary">
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
      <h2 className="text-2xl font-bold text-secondary font-display">Configuración</h2>

      <div className="bg-white rounded-xl border border-gray-100 p-5 sm:p-6 space-y-6">
        {/* Enabled toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-secondary">Reservas habilitadas</p>
            <p className="text-sm text-gray-500">Permitir que los clientes reserven online</p>
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

        <hr className="border-gray-100" />

        {/* Number fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-secondary mb-1.5">Duración slot (min)</label>
            <input
              type="number"
              min={5}
              max={120}
              value={slotDuration}
              onChange={(e) => setSlotDuration(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-1.5">Días máx anticipación</label>
            <input
              type="number"
              min={1}
              max={365}
              value={maxAdvanceDays}
              onChange={(e) => setMaxAdvanceDays(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-1.5">Horas mín anticipación</label>
            <input
              type="number"
              min={0}
              max={72}
              value={minAdvanceHours}
              onChange={(e) => setMinAdvanceHours(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-1.5">Buffer entre citas (min)</label>
            <input
              type="number"
              min={0}
              max={60}
              value={bufferMinutes}
              onChange={(e) => setBufferMinutes(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Auto-confirm toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-secondary">Auto-confirmar</p>
            <p className="text-sm text-gray-500">Confirmar citas automáticamente al reservar</p>
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

        <hr className="border-gray-100" />

        {/* Notification fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-secondary mb-1.5">Email notificaciones</label>
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              value={notifEmail}
              onChange={(e) => setNotifEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-1.5">Telegram Chat ID</label>
            <input
              type="text"
              placeholder="123456789"
              value={telegramChatId}
              onChange={(e) => setTelegramChatId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary mb-1.5">Política de cancelación</label>
          <textarea
            rows={3}
            placeholder="Escribe la política de cancelación..."
            value={cancellationPolicy}
            onChange={(e) => setCancellationPolicy(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
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

// ─── Main Admin Page ─────────────────────────────────────────────────

export default function AdminPage() {
  const clinic = useClinic()
  const [token, setToken] = useState<string | null>(null)
  const [authState, setAuthState] = useState<"loading" | "valid" | "invalid">("loading")
  const [activeTab, setActiveTab] = useState<TabId>("hoy")

  // Authentication
  useEffect(() => {
    const urlToken = new URLSearchParams(window.location.search).get("token")
    if (!urlToken) {
      setAuthState("invalid")
      return
    }
    validateOwnerToken(urlToken).then((res) => {
      if (res.valid) {
        setToken(urlToken)
        setAuthState("valid")
      } else {
        setAuthState("invalid")
      }
    }).catch(() => {
      setAuthState("invalid")
    })
  }, [])

  // ─── Loading screen ───────────────────────────────────────────────

  if (authState === "loading") {
    return (
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  // ─── Invalid token screen ─────────────────────────────────────────

  if (authState === "invalid" || !token) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto px-6">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-secondary font-display mb-2">Token inválido</h1>
          <p className="text-gray-500 mb-6">
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
    <div className="fixed inset-0 z-50 bg-neutral">
      {/* Desktop sidebar + content grid */}
      <div className="h-full grid grid-cols-1 md:grid-cols-[240px_1fr]">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex flex-col bg-secondary text-white">
          {/* Clinic name */}
          <div className="p-5 border-b border-white/10">
            <h1 className="text-base font-bold font-display truncate">{clinic.name}</h1>
            <p className="text-xs text-white/50 mt-0.5">Panel de administración</p>
          </div>

          {/* Nav items */}
          <nav className="flex-1 py-4">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-white/20 border-l-2 border-primary text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white border-l-2 border-transparent"
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {item.label}
                </button>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-5 border-t border-white/10">
            <a
              href="/"
              className="flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Volver a la web
            </a>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex flex-col min-h-0">
          {/* Top header bar */}
          <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center justify-between flex-shrink-0">
            <h2 className="text-lg font-bold text-secondary font-display md:block hidden">{activeNavItem.label}</h2>
            {/* Mobile: show clinic name */}
            <h2 className="text-lg font-bold text-secondary font-display md:hidden truncate">{clinic.name}</h2>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 hidden sm:block">
                {formatDateSpanish(new Date())}
              </span>
            </div>
          </header>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 md:pb-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "hoy" && <TabHoy token={token} />}
                {activeTab === "citas" && <TabCitas token={token} />}
                {activeTab === "servicios" && <TabServicios token={token} />}
                {activeTab === "horarios" && <TabHorarios token={token} />}
                {activeTab === "config" && <TabConfig token={token} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-secondary border-t border-white/10">
        <div className="flex items-center justify-around py-2 pb-[env(safe-area-inset-bottom)]">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
