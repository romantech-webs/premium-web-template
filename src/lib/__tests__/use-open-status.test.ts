import { describe, it, expect } from "vitest"
import { computeOpenStatus } from "../use-open-status"

// 2026-08-07 is a Friday, 2026-08-08 a Saturday.
const friday = (h: number, m = 0) => new Date(2026, 7, 7, h, m)
const saturday = (h: number, m = 0) => new Date(2026, 7, 8, h, m)

describe("computeOpenStatus", () => {
  const osteofisiology = [
    { days: "lunes - viernes", hours: "9:00–22:00" }, // en dash, as stored in prod
    { days: "sábado - domingo", hours: "Cerrado" },
  ]

  it("reads an en-dash hour range as open", () => {
    expect(computeOpenStatus(osteofisiology, friday(19, 19))).toEqual({
      isOpen: true,
      label: "Abierto ahora",
    })
  })

  it("still works with a plain hyphen", () => {
    const schedule = [{ days: "lunes - viernes", hours: "9:00 - 22:00" }]
    expect(computeOpenStatus(schedule, friday(10)).isOpen).toBe(true)
  })

  it("announces the opening time before the shift starts", () => {
    expect(computeOpenStatus(osteofisiology, friday(7))).toEqual({
      isOpen: false,
      label: "Abre a las 9:00",
    })
  })

  it("is closed after the shift ends", () => {
    expect(computeOpenStatus(osteofisiology, friday(22, 30))).toEqual({
      isOpen: false,
      label: "Cerrado",
    })
  })

  it("honours a 'Cerrado' weekend entry", () => {
    expect(computeOpenStatus(osteofisiology, saturday(12))).toEqual({
      isOpen: false,
      label: "Cerrado",
    })
  })

  it("handles split shifts", () => {
    const schedule = [{ days: "lunes - viernes", hours: "09:00 - 14:00 / 16:00 - 20:00" }]
    expect(computeOpenStatus(schedule, friday(15)).isOpen).toBe(false)
    expect(computeOpenStatus(schedule, friday(17)).isOpen).toBe(true)
  })

  it("matches weekend day ranges", () => {
    const schedule = [{ days: "sábado - domingo", hours: "10:00 - 14:00" }]
    expect(computeOpenStatus(schedule, saturday(11)).isOpen).toBe(true)
  })
})
