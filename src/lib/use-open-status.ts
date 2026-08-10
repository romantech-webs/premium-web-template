"use client"

import { useState, useEffect } from "react"

export type OpenStatus = { isOpen: boolean; label: string }

/**
 * Configs come from several generators and use whichever dash the copy happened to
 * carry: hyphen, en dash, em dash or minus sign. Normalise before parsing, or a
 * schedule like "9:00–22:00" silently fails to split and the site reads "Cerrado"
 * around the clock.
 */
function normalizeDashes(value: string) {
  // U+2010..U+2015 (hyphen → horizontal bar) plus U+2212 (minus sign).
  return value.replace(/[‐-―−]/g, "-")
}

const DAY_NAMES: Record<string, number[]> = {
  "lunes": [1], "martes": [2], "miércoles": [3], "miercoles": [3],
  "jueves": [4], "viernes": [5], "sábado": [6], "sabado": [6], "domingo": [0],
  "lunes a viernes": [1, 2, 3, 4, 5], "lunes - viernes": [1, 2, 3, 4, 5],
  "lunes a sábado": [1, 2, 3, 4, 5, 6], "lunes - sábado": [1, 2, 3, 4, 5, 6],
  "lunes a sabado": [1, 2, 3, 4, 5, 6], "lunes - sabado": [1, 2, 3, 4, 5, 6],
  "sábado a domingo": [6, 0], "sábado - domingo": [6, 0],
  "sabado a domingo": [6, 0], "sabado - domingo": [6, 0],
  "sábado y domingo": [6, 0], "sabado y domingo": [6, 0],
}

export function computeOpenStatus(
  schedule: Array<{ days: string; hours: string }>,
  now: Date,
): OpenStatus {
  const dayIndex = now.getDay() // 0=Sun
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  let isOpen = false
  let nextOpen = ""

  for (const entry of schedule) {
    const daysLower = normalizeDashes(entry.days).toLowerCase().trim().replace(/\s+/g, " ")
    if (daysLower === "cerrado" || entry.hours.toLowerCase().trim() === "cerrado") continue

    const matchedDays = DAY_NAMES[daysLower]
    if (!matchedDays || !matchedDays.includes(dayIndex)) continue

    // Parse hours like "09:00 - 20:00" or "09:00 - 14:00 / 16:00 - 20:00"
    const timeRanges = normalizeDashes(entry.hours).split("/").map(r => r.trim())
    for (const range of timeRanges) {
      const parts = range.split("-").map(p => p.trim())
      if (parts.length !== 2) continue
      const [openStr, closeStr] = parts
      const openParts = openStr.split(":").map(Number)
      const closeParts = closeStr.split(":").map(Number)
      if (openParts.length < 2 || closeParts.length < 2) continue

      const openMin = openParts[0] * 60 + openParts[1]
      const closeMin = closeParts[0] * 60 + closeParts[1]

      if (currentMinutes >= openMin && currentMinutes < closeMin) {
        isOpen = true
        break
      }

      if (currentMinutes < openMin && !nextOpen) {
        nextOpen = openStr
      }
    }
    if (isOpen) break
  }

  if (isOpen) return { isOpen: true, label: "Abierto ahora" }
  if (nextOpen) return { isOpen: false, label: `Abre a las ${nextOpen}` }
  return { isOpen: false, label: "Cerrado" }
}

export function useOpenStatus(schedule: Array<{ days: string; hours: string }>) {
  const [status, setStatus] = useState<OpenStatus | null>(null)

  useEffect(() => {
    function check() {
      const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Madrid" }))
      setStatus(computeOpenStatus(schedule, now))
    }

    check()
    const interval = setInterval(check, 60000)
    return () => clearInterval(interval)
  }, [schedule])

  return status
}
