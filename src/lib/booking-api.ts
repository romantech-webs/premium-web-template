// Booking API client — shared between /reservar and /admin pages

function getApiUrl(): string {
  if (typeof window === "undefined") return ""
  return (window as unknown as Record<string, unknown>).__WIDGET_API_URL as string || ""
}

function getProjectId(): string {
  if (typeof window === "undefined") return ""
  return (window as unknown as Record<string, unknown>).__PROJECT_ID as string || ""
}

// ─── Types ──────────────────────────────────────────────────────────

export interface BookingService {
  id: string
  name: string
  durationMin: number
  price: string | null
  description: string | null
}

export interface BookingEmployee {
  id: string
  name: string
  role: string | null
  color: string
}

export interface TimeSlot {
  time: string
  available: boolean
}

export interface BookingConfigPublic {
  slotDurationMin: number
  maxAdvanceDays: number
  timezone: string
  cancellationPolicy: string | null
}

export interface AvailabilityResponse {
  employees: BookingEmployee[]
  services: BookingService[]
  config: BookingConfigPublic
  slots: Record<string, TimeSlot[]>
}

export interface BookingResult {
  success: boolean
  bookingId: string
  confirmationCode: string
  status: string
  scheduledAt: string
  employeeName: string
  serviceName: string
}

export interface AppointmentDetail {
  id: string
  confirmationCode: string
  status: string
  scheduledAt: string
  durationMin: number
  customer: { name: string; phone: string; email: string | null; notes: string | null }
  employee: { name: string; role: string | null } | null
  service: { name: string; durationMin: number; price: string | null } | null
  source: string
  createdAt: string
}

export interface ManagedAppointment {
  id: string
  projectId: string
  employeeId: string
  serviceId: string
  scheduledAt: string
  durationMin: number
  status: string
  confirmationCode: string
  customerName: string
  customerPhone: string
  customerEmail: string | null
  customerNotes: string | null
  source: string
  createdAt: string
  confirmedAt: string | null
  cancelledAt: string | null
  cancelReason: string | null
  employeeName: string | null
  serviceName: string | null
}

// ─── Public APIs (no auth) ──────────────────────────────────────────

export async function fetchAvailability(
  date: string,
  serviceId?: string,
  employeeId?: string
): Promise<AvailabilityResponse> {
  const api = getApiUrl()
  const pid = getProjectId()
  const params = new URLSearchParams({ projectId: pid, date })
  if (serviceId) params.set("serviceId", serviceId)
  if (employeeId) params.set("employeeId", employeeId)
  const res = await fetch(`${api}/api/booking/availability?${params}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Error de red" }))
    throw new Error(err.error || "Error al obtener disponibilidad")
  }
  return res.json()
}

export async function createBooking(data: {
  employeeId: string
  serviceId: string
  date: string
  time: string
  customer: { name: string; phone: string; email?: string; notes?: string }
  source?: string
}): Promise<BookingResult> {
  const api = getApiUrl()
  const pid = getProjectId()
  const res = await fetch(`${api}/api/booking/book`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId: pid, source: "web", ...data }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Error de red" }))
    throw new Error(err.error || "Error al reservar")
  }
  return res.json()
}

export async function lookupAppointment(code: string): Promise<AppointmentDetail> {
  const api = getApiUrl()
  const res = await fetch(`${api}/api/booking/${encodeURIComponent(code)}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Cita no encontrada" }))
    throw new Error(err.error || "Cita no encontrada")
  }
  return res.json()
}

export async function cancelAppointment(id: string, reason?: string): Promise<void> {
  const api = getApiUrl()
  const res = await fetch(`${api}/api/booking/${id}/cancel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Error al cancelar" }))
    throw new Error(err.error || "Error al cancelar")
  }
}

export async function joinWaitlist(data: {
  serviceId?: string
  customerName: string
  customerPhone: string
}): Promise<void> {
  const api = getApiUrl()
  const pid = getProjectId()
  const res = await fetch(`${api}/api/booking/waitlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId: pid, ...data }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Error" }))
    throw new Error(err.error || "Error al registrar en lista de espera")
  }
}

// ─── Owner/Admin APIs (requires Bearer token) ──────────────────────

function authHeaders(token: string): HeadersInit {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
}

export async function validateOwnerToken(token: string): Promise<{
  valid: boolean
  projectId: string
  clinicName: string
  config: Record<string, unknown>
}> {
  const api = getApiUrl()
  const res = await fetch(`${api}/api/booking/owner/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  })
  return res.json()
}

export async function fetchAppointments(
  token: string,
  params?: { from?: string; to?: string; status?: string; employeeId?: string; page?: number }
): Promise<{ appointments: ManagedAppointment[]; page: number; limit: number }> {
  const api = getApiUrl()
  const qs = new URLSearchParams()
  if (params?.from) qs.set("from", params.from)
  if (params?.to) qs.set("to", params.to)
  if (params?.status) qs.set("status", params.status)
  if (params?.employeeId) qs.set("employeeId", params.employeeId)
  if (params?.page) qs.set("page", String(params.page))
  const res = await fetch(`${api}/api/booking/manage?${qs}`, { headers: authHeaders(token) })
  if (!res.ok) throw new Error("Error al cargar citas")
  return res.json()
}

export async function updateAppointmentStatus(
  token: string, id: string, status: string, cancelReason?: string
): Promise<void> {
  const api = getApiUrl()
  const res = await fetch(`${api}/api/booking/manage/${id}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ status, cancelReason }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Error" }))
    throw new Error(err.error || "Error al actualizar cita")
  }
}

export async function fetchOwnerConfig(token: string): Promise<Record<string, unknown> | null> {
  const api = getApiUrl()
  const res = await fetch(`${api}/api/booking/manage/config`, { headers: authHeaders(token) })
  if (!res.ok) return null
  const data = await res.json()
  return data.config
}

export async function updateOwnerConfig(token: string, data: Record<string, unknown>): Promise<void> {
  const api = getApiUrl()
  const res = await fetch(`${api}/api/booking/manage/config`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Error al guardar configuración")
}

export async function fetchOwnerEmployees(token: string): Promise<{
  employees: Array<BookingEmployee & { active: boolean; serviceIds: string[] }>
}> {
  const api = getApiUrl()
  const res = await fetch(`${api}/api/booking/manage/employees`, { headers: authHeaders(token) })
  if (!res.ok) throw new Error("Error al cargar profesionales")
  return res.json()
}

export async function fetchOwnerServices(token: string): Promise<{
  services: Array<BookingService & { active: boolean; sortOrder: number }>
}> {
  const api = getApiUrl()
  const res = await fetch(`${api}/api/booking/manage/services`, { headers: authHeaders(token) })
  if (!res.ok) throw new Error("Error al cargar servicios")
  return res.json()
}

export async function manageService(token: string, data: Record<string, unknown>): Promise<void> {
  const api = getApiUrl()
  const res = await fetch(`${api}/api/booking/manage/services`, {
    method: "POST", headers: authHeaders(token), body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Error" }))
    throw new Error(err.error || "Error al gestionar servicio")
  }
}

export async function manageEmployee(token: string, data: Record<string, unknown>): Promise<void> {
  const api = getApiUrl()
  const res = await fetch(`${api}/api/booking/manage/employees`, {
    method: "POST", headers: authHeaders(token), body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Error" }))
    throw new Error(err.error || "Error al gestionar profesional")
  }
}

export async function fetchSchedules(token: string, employeeId: string): Promise<{
  schedules: Array<{ id: string; dayOfWeek: number; startTime: string; endTime: string; breakStart: string | null; breakEnd: string | null }>
}> {
  const api = getApiUrl()
  const res = await fetch(`${api}/api/booking/manage/schedules?employeeId=${employeeId}`, {
    headers: authHeaders(token),
  })
  if (!res.ok) throw new Error("Error al cargar horarios")
  return res.json()
}

export async function manageSchedule(token: string, data: Record<string, unknown>): Promise<void> {
  const api = getApiUrl()
  const res = await fetch(`${api}/api/booking/manage/schedules`, {
    method: "POST", headers: authHeaders(token), body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Error" }))
    throw new Error(err.error || "Error al gestionar horario")
  }
}

export async function fetchExceptions(token: string, employeeId: string): Promise<{
  exceptions: Array<{ id: string; date: string; available: boolean; startTime: string | null; endTime: string | null; reason: string | null }>
}> {
  const api = getApiUrl()
  const res = await fetch(`${api}/api/booking/manage/exceptions?employeeId=${employeeId}`, {
    headers: authHeaders(token),
  })
  if (!res.ok) throw new Error("Error al cargar excepciones")
  return res.json()
}

export async function manualCreateBooking(token: string, data: {
  employeeId: string; serviceId: string; date: string; time: string;
  customer: { name: string; phone: string; email?: string; notes?: string };
}): Promise<BookingResult> {
  const api = getApiUrl()
  const pid = getProjectId()
  const res = await fetch(`${api}/api/booking/book`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ projectId: pid, source: "manual", ...data }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Error" }))
    throw new Error(err.error || "Error al crear cita")
  }
  return res.json()
}

export async function rescheduleAppointment(
  token: string,
  id: string,
  data: { date: string; time: string; employeeId?: string }
): Promise<{ success: boolean; scheduledAt: string; employeeName: string }> {
  const api = getApiUrl()
  const res = await fetch(`${api}/api/booking/manage/${id}/reschedule`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Error" }))
    throw new Error(err.error || "Error al reagendar cita")
  }
  return res.json()
}

export async function manageException(token: string, data: Record<string, unknown>): Promise<void> {
  const api = getApiUrl()
  const res = await fetch(`${api}/api/booking/manage/exceptions`, {
    method: "POST", headers: authHeaders(token), body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Error" }))
    throw new Error(err.error || "Error al gestionar excepción")
  }
}
