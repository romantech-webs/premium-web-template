"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, X } from "lucide-react"
import { useClinic } from "@/config/clinic-context"

export function DemoBanner() {
  const clinic = useClinic()
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const isDemo = clinic._meta?.isDemo
  const leadId = clinic._meta?.leadId
  const apiUrl = clinic._meta?.widgetApiUrl

  // Don't render for paid clients or if no leadId
  useEffect(() => {
    if (!isDemo || !leadId) return
    // Show after 3 seconds
    const timer = setTimeout(() => setVisible(true), 3000)
    return () => clearTimeout(timer)
  }, [isDemo, leadId])

  if (!isDemo || !leadId || !apiUrl || dismissed) return null

  const proposalUrl = `${apiUrl}/p/${leadId}`

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -80 }}
          animate={{ y: 0 }}
          exit={{ y: -80 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-50"
        >
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg">
            <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles className="w-5 h-5 shrink-0 text-amber-300" />
                <p className="text-sm font-medium truncate">
                  <span className="hidden sm:inline">Esta web es tuya. </span>
                  Activala por solo <strong>118€/mes</strong> (IVA inc.)
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={proposalUrl}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white text-indigo-700 text-sm font-bold hover:bg-indigo-50 transition-colors"
                >
                  Ver oferta
                </a>
                <button
                  onClick={() => setDismissed(true)}
                  className="p-1 rounded-full hover:bg-white/20 transition-colors"
                  aria-label="Cerrar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
