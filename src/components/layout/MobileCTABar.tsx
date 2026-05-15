"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Phone } from "lucide-react"
import { useClinic } from "@/config/clinic-context"

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

export function MobileCTABar() {
  const clinic = useClinic()
  const [isVisible, setIsVisible] = useState(false)
  const [overlayOpen, setOverlayOpen] = useState(false)
  const whatsappUrl = `https://wa.me/${clinic.whatsapp}?text=${encodeURIComponent(clinic.whatsappMessage)}`

  useEffect(() => {
    const handleScroll = () => {
      // Hidden in the hero (first ~700px). Showing earlier covers the LCP
      // element and the primary in-hero CTAs on mobile.
      setIsVisible(window.scrollY > 600)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Watch for data-overlay-open attribute on body (set by Header menu + Gallery lightbox)
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setOverlayOpen(document.body.hasAttribute("data-overlay-open"))
    })
    observer.observe(document.body, { attributes: true, attributeFilter: ["data-overlay-open"] })
    return () => observer.disconnect()
  }, [])

  return (
    <AnimatePresence>
      {isVisible && !overlayOpen && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-[99999] lg:hidden"
        >
          <div
            className="bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] px-4 flex items-center gap-3"
            style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))", paddingTop: "12px", height: "auto" }}
          >
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white text-sm"
              style={{ background: "linear-gradient(135deg, var(--color-primary) 0%, color-mix(in srgb, var(--color-primary), black 15%) 100%)" }}
              aria-label="Pedir cita por WhatsApp"
            >
              <WhatsAppIcon className="w-5 h-5" />
              {clinic.ctaLabel || "Pedir Cita"}
            </a>
            <a
              href={`tel:${clinic.phone.replace(/\s/g, "")}`}
              className="w-12 h-12 flex items-center justify-center rounded-xl border-2 border-gray-200 text-secondary shrink-0"
              aria-label="Llamar por teléfono"
            >
              <Phone className="w-5 h-5" />
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
