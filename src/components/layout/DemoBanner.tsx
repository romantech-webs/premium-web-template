"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { useClinic } from "@/config/clinic-context"

const DISMISS_KEY = "demo-aviso-cerrado"

// Aviso discreto de demo: tarjeta abajo a la izquierda (escritorio) o píldora sobre la
// barra de "Pedir cita" (móvil). No tapa la cabecera ni lleva enlace: el precio va escrito
// para que coincida con lo que se habla por WhatsApp.
export function DemoBanner() {
  const clinic = useClinic()
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const isDemo = clinic._meta?.isDemo
  const leadId = clinic._meta?.leadId

  useEffect(() => {
    if (!isDemo || !leadId) return
    try { if (sessionStorage.getItem(DISMISS_KEY)) { setDismissed(true); return } } catch {}
    // Aparece pasado el hero y con el aviso de cookies ya contestado, para no solaparse con él
    const check = () => {
      let consent: string | null = null
      try { consent = localStorage.getItem("cookie-consent") } catch {}
      if (window.scrollY > window.innerHeight * 0.7 && consent) {
        setVisible(true)
        window.removeEventListener("scroll", check)
      }
    }
    window.addEventListener("scroll", check, { passive: true })
    return () => window.removeEventListener("scroll", check)
  }, [isDemo, leadId])

  if (!isDemo || !leadId || dismissed) return null

  const close = () => {
    setDismissed(true)
    try { sessionStorage.setItem(DISMISS_KEY, "1") } catch {}
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          aria-label="Propuesta de web"
          className="fixed z-[9998] left-3 right-3 bottom-[calc(84px_+_env(safe-area-inset-bottom))] lg:left-6 lg:right-auto lg:bottom-6 lg:max-w-sm"
        >
          <div className="relative flex items-start gap-3 rounded-2xl bg-white/95 backdrop-blur-xl border border-gray-200 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.25)] pl-4 pr-10 py-3 lg:py-4 overflow-hidden">
            <span className="absolute left-0 top-0 bottom-0 w-1 bg-primary" aria-hidden />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                Propuesta de web
              </p>
              <p className="mt-0.5 text-sm leading-snug text-secondary">
                <span className="hidden lg:inline">Esta web puede ser la vuestra: </span>
                sin coste de alta y <strong>59 €/mes</strong> con IVA, sin permanencia.
              </p>
            </div>
            <button
              onClick={close}
              className="absolute top-2 right-2 p-1.5 rounded-full text-gray-400 hover:text-secondary hover:bg-gray-100 transition-colors"
              aria-label="Cerrar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
