"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FileText,
  Calendar,
  User,
  Check,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  CalendarPlus,
  ArrowLeft,
  ArrowRight,
} from "lucide-react"
import { useClinic } from "@/config/clinic-context"
import {
  fetchAvailability,
  createBooking,
  joinWaitlist,
} from "@/lib/booking-api"
import type {
  BookingService,
  BookingEmployee,
  TimeSlot,
  BookingConfigPublic,
  AvailabilityResponse,
  BookingResult,
} from "@/lib/booking-api"
import Link from "next/link"

// ─── Spanish locale helpers ──────────────────────────────────────────

const MONTHS_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]

const DAYS_ES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

const DAYS_FULL_ES = [
  "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado",
]

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number)
  const date = new Date(y, m - 1, d)
  const dayName = DAYS_FULL_ES[date.getDay()]
  const shortDay = dayName.slice(0, 3)
  return `${shortDay} ${d} de ${MONTHS_ES[m - 1]}`
}

function formatPrice(price: string | null): string {
  if (!price) return ""
  const num = parseFloat(price)
  if (isNaN(num)) return price
  return num % 1 === 0 ? `${num.toFixed(0)}\u20AC` : `${num.toFixed(2)}\u20AC`
}

function formatDuration(min: number): string {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

function toDateStr(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function getTodayInTz(tz: string): Date {
  const now = new Date()
  const str = now.toLocaleDateString("en-CA", { timeZone: tz })
  const [y, m, d] = str.split("-").map(Number)
  return new Date(y, m - 1, d)
}

function generateICalEvent(booking: BookingResult, service: BookingService, clinic: { name: string }) {
  const dt = new Date(booking.scheduledAt)
  const end = new Date(dt.getTime() + service.durationMin * 60_000)
  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//premium-web//booking//ES",
    "BEGIN:VEVENT",
    `DTSTART:${fmt(dt)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${booking.serviceName} - ${clinic.name}`,
    `DESCRIPTION:Código de confirmación: ${booking.confirmationCode}\\nProfesional: ${booking.employeeName}`,
    `UID:${booking.bookingId}@premium-web`,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `reserva-${booking.confirmationCode}.ics`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Stepper ─────────────────────────────────────────────────────────

const STEPS = [
  { label: "Servicio", icon: FileText },
  { label: "Fecha y hora", icon: Calendar },
  { label: "Tus datos", icon: User },
  { label: "Confirmación", icon: Check },
]

function Stepper({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 mb-10">
      {STEPS.map((step, i) => {
        const Icon = step.icon
        const isDone = i < current
        const isActive = i === current
        return (
          <div key={i} className="flex items-center gap-2 sm:gap-4">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  isActive
                    ? "bg-primary text-white"
                    : isDone
                      ? "bg-primary/20 text-primary"
                      : "bg-gray-200 text-gray-400"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={`text-xs font-medium hidden sm:block ${
                  isActive ? "text-primary" : isDone ? "text-primary/70" : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`w-8 sm:w-12 h-0.5 ${
                  i < current ? "bg-primary/30" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Calendar ────────────────────────────────────────────────────────

function MiniCalendar({
  selected,
  onSelect,
  today,
  maxDate,
}: {
  selected: string | null
  onSelect: (d: string) => void
  today: Date
  maxDate: Date
}) {
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const todayStr = toDateStr(today)
  const maxStr = toDateStr(maxDate)

  const firstDay = new Date(viewYear, viewMonth, 1)
  // Monday = 0 ... Sunday = 6
  let startDow = firstDay.getDay() - 1
  if (startDow < 0) startDow = 6
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const cells: (number | null)[] = []
  for (let i = 0; i < startDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const canPrev = viewYear > today.getFullYear() || viewMonth > today.getMonth()
  const canNext = (() => {
    const nextM = viewMonth === 11 ? 0 : viewMonth + 1
    const nextY = viewMonth === 11 ? viewYear + 1 : viewYear
    return new Date(nextY, nextM, 1) <= maxDate
  })()

  const goPrev = () => {
    if (!canPrev) return
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1) }
    else setViewMonth(viewMonth - 1)
  }

  const goNext = () => {
    if (!canNext) return
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1) }
    else setViewMonth(viewMonth + 1)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={goPrev}
          disabled={!canPrev}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-secondary" />
        </button>
        <span className="font-display font-semibold text-secondary">
          {MONTHS_ES[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={goNext}
          disabled={!canNext}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-secondary" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS_ES.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-secondary/50 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />
          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
          const isPast = dateStr < todayStr
          const isBeyondMax = dateStr > maxStr
          const isDisabled = isPast || isBeyondMax
          const isToday = dateStr === todayStr
          const isSelected = dateStr === selected

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => !isDisabled && onSelect(dateStr)}
              disabled={isDisabled}
              className={`
                aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all
                ${isDisabled ? "text-gray-300 cursor-not-allowed" : "hover:bg-primary/10 cursor-pointer"}
                ${isSelected ? "bg-primary text-white hover:bg-primary" : ""}
                ${isToday && !isSelected ? "ring-2 ring-primary/40 text-primary font-bold" : ""}
                ${!isDisabled && !isSelected && !isToday ? "text-secondary" : ""}
              `}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main page ───────────────────────────────────────────────────────

export default function ReservarPage() {
  const clinic = useClinic()

  // Wizard state
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Data from API
  const [services, setServices] = useState<BookingService[]>([])
  const [employees, setEmployees] = useState<BookingEmployee[]>([])
  const [config, setConfig] = useState<BookingConfigPublic | null>(null)
  const [slots, setSlots] = useState<Record<string, TimeSlot[]>>({})
  const [slotsLoading, setSlotsLoading] = useState(false)

  // Selections
  const [selectedService, setSelectedService] = useState<BookingService | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<BookingEmployee | null>(null)
  const [employeeFilter, setEmployeeFilter] = useState<string | null>(null)

  // Client form
  const [clientName, setClientName] = useState("")
  const [clientPhone, setClientPhone] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [clientNotes, setClientNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Confirmation
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null)

  // Waitlist
  const [showWaitlist, setShowWaitlist] = useState(false)
  const [waitlistName, setWaitlistName] = useState("")
  const [waitlistPhone, setWaitlistPhone] = useState("")
  const [waitlistSubmitting, setWaitlistSubmitting] = useState(false)
  const [waitlistDone, setWaitlistDone] = useState(false)

  const tz = config?.timezone || "Europe/Madrid"

  // Load initial availability on mount
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const today = getTodayInTz("Europe/Madrid")
        const data: AvailabilityResponse = await fetchAvailability(toDateStr(today))
        if (cancelled) return
        setServices(data.services)
        setEmployees(data.employees)
        setConfig(data.config)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Error al cargar servicios")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  // Load slots when date changes (step 2)
  const loadSlots = useCallback(
    async (date: string, serviceId?: string) => {
      try {
        setSlotsLoading(true)
        setSlots({})
        setSelectedTime(null)
        setSelectedEmployee(null)
        setShowWaitlist(false)
        setWaitlistDone(false)
        const data = await fetchAvailability(date, serviceId)
        setSlots(data.slots)
        setEmployees(data.employees)
      } catch {
        setSlots({})
      } finally {
        setSlotsLoading(false)
      }
    },
    []
  )

  // Computed: today & maxDate
  const today = useMemo(() => getTodayInTz(tz), [tz])
  const maxDate = useMemo(() => {
    const d = new Date(today)
    d.setDate(d.getDate() + (config?.maxAdvanceDays || 60))
    return d
  }, [today, config?.maxAdvanceDays])

  // Computed: filtered slots
  const filteredSlots = useMemo(() => {
    if (!slots || Object.keys(slots).length === 0) return []
    const empIds = employeeFilter ? [employeeFilter] : Object.keys(slots)
    const merged = new Map<string, { time: string; available: boolean; employeeId: string }>()
    for (const empId of empIds) {
      const empSlots = slots[empId] || []
      for (const s of empSlots) {
        if (s.available && !merged.has(s.time)) {
          merged.set(s.time, { ...s, employeeId: empId })
        }
      }
    }
    return Array.from(merged.values()).sort((a, b) => a.time.localeCompare(b.time))
  }, [slots, employeeFilter])

  const morningSlots = useMemo(
    () => filteredSlots.filter((s) => s.time < "14:00"),
    [filteredSlots]
  )
  const afternoonSlots = useMemo(
    () => filteredSlots.filter((s) => s.time >= "14:00"),
    [filteredSlots]
  )

  const hasNoSlots = !slotsLoading && selectedDate && filteredSlots.length === 0

  // Find the employee for the selected time
  const assignedEmployee = useMemo(() => {
    if (!selectedTime) return null
    const slot = filteredSlots.find((s) => s.time === selectedTime)
    if (!slot) return null
    return employees.find((e) => e.id === slot.employeeId) || null
  }, [selectedTime, filteredSlots, employees])

  // Handlers
  const handleSelectService = (svc: BookingService) => {
    setSelectedService(svc)
    setSelectedDate(null)
    setSelectedTime(null)
    setSelectedEmployee(null)
    setEmployeeFilter(null)
    setStep(1)
  }

  const handleSelectDate = (date: string) => {
    setSelectedDate(date)
    if (selectedService) loadSlots(date, selectedService.id)
  }

  const handleSelectTime = (time: string) => {
    setSelectedTime(time)
    const slot = filteredSlots.find((s) => s.time === time)
    if (slot) {
      const emp = employees.find((e) => e.id === slot.employeeId) || null
      setSelectedEmployee(emp)
    }
  }

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedService || !selectedDate || !selectedTime || !assignedEmployee) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const result = await createBooking({
        employeeId: assignedEmployee.id,
        serviceId: selectedService.id,
        date: selectedDate,
        time: selectedTime,
        customer: {
          name: clientName,
          phone: clientPhone,
          email: clientEmail || undefined,
          notes: clientNotes || undefined,
        },
        source: "web",
      })
      setBookingResult(result)
      setStep(3)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Error al reservar")
    } finally {
      setSubmitting(false)
    }
  }

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault()
    setWaitlistSubmitting(true)
    try {
      await joinWaitlist({
        serviceId: selectedService?.id,
        customerName: waitlistName,
        customerPhone: waitlistPhone,
      })
      setWaitlistDone(true)
    } catch {
      // silently handle
    } finally {
      setWaitlistSubmitting(false)
    }
  }

  // ─── Render ──────────────────────────────────────────────────────

  return (
    <div className="pt-24 min-h-screen bg-neutral">
      <div className="section-padding">
        <div className="container-wide">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-secondary mb-3">
              Reserva tu cita
            </h1>
            <p className="text-secondary/60">
              Elige un servicio, fecha y hora que te convenga
            </p>
          </motion.div>

          {/* Stepper */}
          <Stepper current={step} />

          {/* Error state */}
          {error && (
            <div className="max-w-xl mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
              <p className="text-secondary/60">Cargando servicios...</p>
            </div>
          )}

          {/* Steps */}
          <AnimatePresence mode="wait">
            {/* ─── Step 0: Service Selection ──────────────── */}
            {!loading && !error && step === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
                  {services.map((svc) => (
                    <motion.button
                      key={svc.id}
                      type="button"
                      onClick={() => handleSelectService(svc)}
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-white rounded-2xl p-6 text-left shadow-sm hover:shadow-md transition-shadow border border-transparent hover:border-primary/20 group"
                    >
                      <h3 className="font-display font-semibold text-secondary text-lg mb-2 group-hover:text-primary transition-colors">
                        {svc.name}
                      </h3>
                      {svc.description && (
                        <p className="text-secondary/60 text-sm mb-4 line-clamp-2">
                          {svc.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-secondary/50 text-sm">
                          <Clock className="w-4 h-4" />
                          <span>{formatDuration(svc.durationMin)}</span>
                        </div>
                        {svc.price && (
                          <span className="text-primary font-bold text-lg">
                            {formatPrice(svc.price)}
                          </span>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>

                {services.length === 0 && !loading && (
                  <p className="text-center text-secondary/50 py-12">
                    No hay servicios configurados todavía.
                  </p>
                )}

                <div className="text-center mt-8">
                  <Link
                    href="/reservar/consultar"
                    className="text-sm text-primary hover:underline"
                  >
                    ¿Ya tienes una cita? Consulta tu reserva
                  </Link>
                </div>
              </motion.div>
            )}

            {/* ─── Step 1: Date & Time ────────────────────── */}
            {!loading && step === 1 && selectedService && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
              >
                {/* Back + service summary */}
                <div className="max-w-5xl mx-auto mb-6">
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="flex items-center gap-2 text-secondary/60 hover:text-secondary mb-4 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm">Cambiar servicio</span>
                  </button>

                  <div className="bg-white rounded-xl p-4 flex flex-wrap items-center gap-4 shadow-sm">
                    <span className="font-semibold text-secondary">
                      {selectedService.name}
                    </span>
                    <div className="flex items-center gap-1.5 text-secondary/50 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>{formatDuration(selectedService.durationMin)}</span>
                    </div>
                    {selectedService.price && (
                      <span className="text-primary font-bold">
                        {formatPrice(selectedService.price)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Calendar + slots layout */}
                <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-6">
                  {/* Calendar */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="font-display font-semibold text-secondary mb-4">
                      Elige una fecha
                    </h3>
                    <MiniCalendar
                      selected={selectedDate}
                      onSelect={handleSelectDate}
                      today={today}
                      maxDate={maxDate}
                    />
                  </div>

                  {/* Time slots */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="font-display font-semibold text-secondary mb-4">
                      Elige una hora
                    </h3>

                    {!selectedDate && (
                      <p className="text-secondary/40 text-sm py-8 text-center">
                        Selecciona una fecha en el calendario
                      </p>
                    )}

                    {selectedDate && slotsLoading && (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 text-primary animate-spin" />
                      </div>
                    )}

                    {selectedDate && !slotsLoading && (
                      <>
                        {/* Employee filter chips */}
                        {employees.length > 1 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            <button
                              type="button"
                              onClick={() => setEmployeeFilter(null)}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                !employeeFilter
                                  ? "bg-primary text-white"
                                  : "bg-gray-100 text-secondary/60 hover:bg-gray-200"
                              }`}
                            >
                              Todos
                            </button>
                            {employees.map((emp) => (
                              <button
                                key={emp.id}
                                type="button"
                                onClick={() =>
                                  setEmployeeFilter(employeeFilter === emp.id ? null : emp.id)
                                }
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
                                  employeeFilter === emp.id
                                    ? "bg-primary text-white"
                                    : "bg-gray-100 text-secondary/60 hover:bg-gray-200"
                                }`}
                              >
                                <span
                                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: emp.color }}
                                />
                                {emp.name}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* No slots */}
                        {hasNoSlots && !waitlistDone && (
                          <div className="text-center py-8">
                            <p className="text-secondary/50 mb-4">
                              No hay horas disponibles para esta fecha.
                            </p>
                            {!showWaitlist ? (
                              <button
                                type="button"
                                onClick={() => setShowWaitlist(true)}
                                className="text-sm text-primary hover:underline"
                              >
                                Apuntarme a la lista de espera
                              </button>
                            ) : (
                              <form
                                onSubmit={handleWaitlist}
                                className="max-w-xs mx-auto space-y-3"
                              >
                                <input
                                  type="text"
                                  placeholder="Tu nombre"
                                  required
                                  value={waitlistName}
                                  onChange={(e) => setWaitlistName(e.target.value)}
                                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                                <input
                                  type="tel"
                                  placeholder="Tu teléfono"
                                  required
                                  pattern="^[+\d\s()\-]{6,20}$"
                                  value={waitlistPhone}
                                  onChange={(e) => setWaitlistPhone(e.target.value)}
                                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                                <button
                                  type="submit"
                                  disabled={waitlistSubmitting}
                                  className="btn-primary w-full text-sm !py-2.5"
                                >
                                  <span className="relative z-10 flex items-center justify-center gap-2">
                                    {waitlistSubmitting ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : null}
                                    Apuntarme
                                  </span>
                                </button>
                              </form>
                            )}
                          </div>
                        )}

                        {hasNoSlots && waitlistDone && (
                          <div className="text-center py-8">
                            <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
                            <p className="text-secondary/70 text-sm">
                              Te avisaremos cuando haya disponibilidad.
                            </p>
                          </div>
                        )}

                        {/* Slot grid */}
                        {!hasNoSlots && (
                          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                            {morningSlots.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-secondary/40 uppercase tracking-wider mb-2">
                                  Ma\u00F1ana
                                </p>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                  {morningSlots.map((s) => (
                                    <button
                                      key={s.time}
                                      type="button"
                                      onClick={() => handleSelectTime(s.time)}
                                      className={`py-2.5 px-2 rounded-lg text-sm font-medium transition-all ${
                                        selectedTime === s.time
                                          ? "bg-primary text-white shadow-md"
                                          : "bg-gray-50 text-secondary hover:bg-primary/10"
                                      }`}
                                    >
                                      {s.time}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {afternoonSlots.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-secondary/40 uppercase tracking-wider mb-2">
                                  Tarde
                                </p>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                  {afternoonSlots.map((s) => (
                                    <button
                                      key={s.time}
                                      type="button"
                                      onClick={() => handleSelectTime(s.time)}
                                      className={`py-2.5 px-2 rounded-lg text-sm font-medium transition-all ${
                                        selectedTime === s.time
                                          ? "bg-primary text-white shadow-md"
                                          : "bg-gray-50 text-secondary hover:bg-primary/10"
                                      }`}
                                    >
                                      {s.time}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Assigned employee */}
                        {selectedTime && assignedEmployee && (
                          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-sm text-secondary/60">
                            <span
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: assignedEmployee.color }}
                            />
                            <span>
                              Con <strong className="text-secondary">{assignedEmployee.name}</strong>
                              {assignedEmployee.role && ` \u2014 ${assignedEmployee.role}`}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Continue button */}
                {selectedDate && selectedTime && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-5xl mx-auto mt-6 flex justify-end"
                  >
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="btn-primary"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        Continuar
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ─── Step 2: Client Form ────────────────────── */}
            {step === 2 && selectedService && selectedDate && selectedTime && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
              >
                <div className="max-w-5xl mx-auto">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 text-secondary/60 hover:text-secondary mb-6 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm">Cambiar fecha y hora</span>
                  </button>

                  <div className="grid lg:grid-cols-5 gap-8">
                    {/* Form */}
                    <div className="lg:col-span-3">
                      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
                        <h3 className="font-display font-semibold text-secondary text-xl mb-6">
                          Tus datos
                        </h3>

                        <form onSubmit={handleSubmitBooking} className="space-y-5">
                          <div>
                            <label
                              htmlFor="booking-name"
                              className="block text-sm font-medium text-secondary mb-2"
                            >
                              Nombre completo *
                            </label>
                            <input
                              type="text"
                              id="booking-name"
                              required
                              value={clientName}
                              onChange={(e) => setClientName(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                              placeholder="Tu nombre"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="booking-phone"
                              className="block text-sm font-medium text-secondary mb-2"
                            >
                              Tel\u00E9fono *
                            </label>
                            <input
                              type="tel"
                              id="booking-phone"
                              required
                              pattern="^[+\d\s()\-]{6,20}$"
                              value={clientPhone}
                              onChange={(e) => setClientPhone(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                              placeholder="+34 XXX XXX XXX"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="booking-email"
                              className="block text-sm font-medium text-secondary mb-2"
                            >
                              Email{" "}
                              <span className="text-secondary/40 font-normal">(opcional)</span>
                            </label>
                            <input
                              type="email"
                              id="booking-email"
                              value={clientEmail}
                              onChange={(e) => setClientEmail(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                              placeholder="tu@email.com"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="booking-notes"
                              className="block text-sm font-medium text-secondary mb-2"
                            >
                              Notas{" "}
                              <span className="text-secondary/40 font-normal">(opcional)</span>
                            </label>
                            <textarea
                              id="booking-notes"
                              value={clientNotes}
                              onChange={(e) => setClientNotes(e.target.value)}
                              rows={3}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                              placeholder="Algo que quieras comentarnos..."
                            />
                          </div>

                          {config?.cancellationPolicy && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                              <strong>Pol\u00EDtica de cancelaci\u00F3n:</strong>{" "}
                              {config.cancellationPolicy}
                            </div>
                          )}

                          <div className="text-xs text-secondary/50">
                            Al confirmar tu reserva aceptas nuestra{" "}
                            <Link href="/privacidad" className="text-primary hover:underline">
                              pol\u00EDtica de privacidad
                            </Link>
                            .
                          </div>

                          {submitError && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-red-700">{submitError}</p>
                            </div>
                          )}

                          <button
                            type="submit"
                            disabled={submitting}
                            className="btn-primary w-full"
                          >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                              {submitting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <Check className="w-5 h-5" />
                              )}
                              {submitting ? "Confirmando..." : "Confirmar reserva"}
                            </span>
                          </button>
                        </form>
                      </div>
                    </div>

                    {/* Summary card */}
                    <div className="lg:col-span-2">
                      <div className="bg-white rounded-2xl p-6 shadow-sm lg:sticky lg:top-28">
                        <h4 className="font-display font-semibold text-secondary mb-4">
                          Resumen de tu cita
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-secondary/60">Servicio</span>
                            <span className="font-medium text-secondary">
                              {selectedService.name}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-secondary/60">Duraci\u00F3n</span>
                            <span className="text-secondary">
                              {formatDuration(selectedService.durationMin)}
                            </span>
                          </div>
                          {selectedService.price && (
                            <div className="flex justify-between text-sm">
                              <span className="text-secondary/60">Precio</span>
                              <span className="font-bold text-primary">
                                {formatPrice(selectedService.price)}
                              </span>
                            </div>
                          )}
                          <hr className="border-gray-100" />
                          <div className="flex justify-between text-sm">
                            <span className="text-secondary/60">Fecha</span>
                            <span className="font-medium text-secondary">
                              {formatDate(selectedDate)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-secondary/60">Hora</span>
                            <span className="font-medium text-secondary">{selectedTime}</span>
                          </div>
                          {assignedEmployee && (
                            <div className="flex justify-between text-sm">
                              <span className="text-secondary/60">Profesional</span>
                              <span className="font-medium text-secondary flex items-center gap-1.5">
                                <span
                                  className="w-2.5 h-2.5 rounded-full inline-block"
                                  style={{ backgroundColor: assignedEmployee.color }}
                                />
                                {assignedEmployee.name}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── Step 3: Confirmation ───────────────────── */}
            {step === 3 && bookingResult && selectedService && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="max-w-lg mx-auto bg-white rounded-2xl p-8 sm:p-10 shadow-sm text-center">
                  {/* Checkmark */}
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>

                  <h2 className="text-2xl font-display font-bold text-secondary mb-2">
                    {bookingResult.status === "confirmed"
                      ? "\u00A1Reserva confirmada!"
                      : "\u00A1Reserva recibida!"}
                  </h2>
                  <p className="text-secondary/60 mb-6">
                    {bookingResult.status === "confirmed"
                      ? "Tu cita ha sido confirmada con \u00E9xito."
                      : "Tu solicitud de cita ha sido recibida. Te confirmaremos pronto."}
                  </p>

                  {/* Confirmation code */}
                  <div className="bg-neutral rounded-xl p-4 mb-8">
                    <p className="text-xs text-secondary/50 uppercase tracking-wider mb-1">
                      C\u00F3digo de confirmaci\u00F3n
                    </p>
                    <p className="text-2xl font-mono font-bold text-primary tracking-widest">
                      {bookingResult.confirmationCode}
                    </p>
                  </div>

                  {/* Details */}
                  <div className="text-left space-y-3 mb-8">
                    <div className="flex justify-between text-sm py-2 border-b border-gray-50">
                      <span className="text-secondary/60">Servicio</span>
                      <span className="font-medium text-secondary">
                        {bookingResult.serviceName}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm py-2 border-b border-gray-50">
                      <span className="text-secondary/60">Profesional</span>
                      <span className="font-medium text-secondary">
                        {bookingResult.employeeName}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm py-2 border-b border-gray-50">
                      <span className="text-secondary/60">Fecha</span>
                      <span className="font-medium text-secondary">
                        {formatDate(selectedDate!)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm py-2 border-b border-gray-50">
                      <span className="text-secondary/60">Hora</span>
                      <span className="font-medium text-secondary">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between text-sm py-2">
                      <span className="text-secondary/60">Duraci\u00F3n</span>
                      <span className="font-medium text-secondary">
                        {formatDuration(selectedService.durationMin)}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-secondary/50 mb-8">
                    Recibir\u00E1s un recordatorio 24h antes de tu cita.
                  </p>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => generateICalEvent(bookingResult, selectedService, clinic)}
                      className="btn-secondary flex-1"
                    >
                      <CalendarPlus className="w-4 h-4 relative z-10" />
                      <span className="relative z-10">A\u00F1adir al calendario</span>
                    </button>
                    <Link href="/" className="btn-primary flex-1">
                      <span className="relative z-10">Volver a la web</span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
