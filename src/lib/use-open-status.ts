"use client"

import { useState, useEffect } from "react"

export function useOpenStatus(schedule: Array<{ days: string; hours: string }>) {
  const [status, setStatus] = useState<{ isOpen: boolean; label: string } | null>(null)

  useEffect(() => {
    function check() {
      const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Madrid" }))
      const dayIndex = now.getDay() // 0=Sun
      const currentMinutes = now.getHours() * 60 + now.getMinutes()

      const dayNames: Record<string, number[]> = {
        "lunes": [1], "martes": [2], "miércoles": [3], "miercoles": [3],
        "jueves": [4], "viernes": [5], "sábado": [6], "sabado": [6], "domingo": [0],
        "lunes a viernes": [1, 2, 3, 4, 5], "lunes - viernes": [1, 2, 3, 4, 5],
        "lunes a sábado": [1, 2, 3, 4, 5, 6], "lunes - sábado": [1, 2, 3, 4, 5, 6],
      }

      let isOpen = false
      let nextOpen = ""

      for (const entry of schedule) {
        const daysLower = entry.days.toLowerCase().trim()
        if (daysLower === "cerrado" || entry.hours.toLowerCase() === "cerrado") continue

        const matchedDays = dayNames[daysLower]
        if (!matchedDays || !matchedDays.includes(dayIndex)) continue

        // Parse hours like "09:00 - 20:00" or "09:00 - 14:00 / 16:00 - 20:00"
        const timeRanges = entry.hours.split("/").map(r => r.trim())
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

      if (isOpen) {
        setStatus({ isOpen: true, label: "Abierto ahora" })
      } else if (nextOpen) {
        setStatus({ isOpen: false, label: `Abre a las ${nextOpen}` })
      } else {
        setStatus({ isOpen: false, label: "Cerrado" })
      }
    }

    check()
    const interval = setInterval(check, 60000)
    return () => clearInterval(interval)
  }, [schedule])

  return status
}
