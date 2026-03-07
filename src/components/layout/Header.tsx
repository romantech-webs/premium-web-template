"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Phone, ArrowUpRight, Instagram, Facebook } from "lucide-react"
import { useClinic } from "@/config/clinic-context"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Servicios", href: "/#servicios" },
  { label: "Equipo", href: "/#equipo" },
  { label: "Opiniones", href: "/#opiniones" },
  { label: "Ubicación", href: "/#ubicacion" },
  { label: "Contacto", href: "/contacto" },
]

function useScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return

    const scrollY = window.scrollY
    const body = document.body

    body.style.position = "fixed"
    body.style.top = `-${scrollY}px`
    body.style.left = "0"
    body.style.right = "0"
    body.style.overflow = "hidden"
    body.setAttribute("data-overlay-open", "true")

    return () => {
      body.style.position = ""
      body.style.top = ""
      body.style.left = ""
      body.style.right = ""
      body.style.overflow = ""
      body.removeAttribute("data-overlay-open")
      window.scrollTo(0, scrollY)
    }
  }, [isLocked])
}

export function Header() {
  const clinic = useClinic()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Robust iOS scroll lock
  useScrollLock(isMobileMenuOpen)

  const closeMenu = useCallback(() => setIsMobileMenuOpen(false), [])

  return (
    <>
      <header
        className={cn(
          "fixed left-0 right-0 z-50 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
          isScrolled
            ? "top-3 mx-auto max-w-[calc(100%-1.5rem)] lg:max-w-5xl rounded-2xl bg-white/85 backdrop-blur-2xl shadow-xl shadow-black/[0.08] border border-white/40 py-2 px-6"
            : "top-0 bg-transparent py-5"
        )}
      >
        <div className={cn(!isScrolled && "container-wide px-4 sm:px-6 lg:px-8")}>
          <nav className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group min-w-0 relative z-10">
              <div className="relative shrink-0">
                <div className={cn(
                  "absolute inset-0 rounded-xl transition-all duration-300",
                  isScrolled ? "bg-primary/10" : "bg-white/20"
                )} />
                {clinic.logo ? (
                  <Image
                    src={clinic.logo}
                    alt={clinic.name}
                    width={44}
                    height={44}
                    className="relative rounded-xl"
                  />
                ) : (
                  <div className="relative w-11 h-11 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-sm tracking-tight">
                    {clinic.name.split(/\s+/).filter(w => w.length > 2).slice(0, 3).map(w => w[0].toUpperCase()).join("")}
                  </div>
                )}
              </div>
              <div className="hidden sm:block min-w-0">
                <span className="block text-xl font-bold tracking-tight text-secondary truncate">
                  {clinic.name}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1 shrink-0">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative px-5 py-2 text-sm font-medium text-secondary/70 hover:text-secondary transition-colors group"
                >
                  {item.label}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-accent transition-all duration-300 group-hover:w-1/2" />
                </Link>
              ))}
            </div>

            {/* CTA Buttons — desktop */}
            <div className="hidden lg:flex items-center gap-3 shrink-0">
              <a
                href={`tel:${clinic.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-2 text-sm font-semibold text-secondary/70 hover:text-primary transition-colors whitespace-nowrap"
                aria-label={`Llamar al ${clinic.phone}`}
              >
                <motion.div
                  className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"
                  animate={{
                    boxShadow: [
                      "0 0 0 0px color-mix(in srgb, var(--color-primary) 20%, transparent)",
                      "0 0 0 6px color-mix(in srgb, var(--color-primary) 0%, transparent)"
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
                >
                  <Phone className="w-4 h-4 text-primary" />
                </motion.div>
                <span className="hidden xl:block">{clinic.phone}</span>
              </a>
              {clinic._meta?.bookingEnabled ? (
                <Link
                  href="/reservar"
                  className="btn-primary text-sm whitespace-nowrap shrink-0"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Pedir Cita
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </Link>
              ) : (
                <a
                  href={`https://wa.me/${clinic.whatsapp}?text=${encodeURIComponent(clinic.whatsappMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary text-sm whitespace-nowrap shrink-0"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Pedir Cita
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </a>
              )}
            </div>

            {/* Mobile Menu Button — z-[60] stays above overlay */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden relative w-12 h-12 flex items-center justify-center z-[60]"
              aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={isMobileMenuOpen}
            >
              <div className="absolute inset-0 bg-secondary/5 rounded-xl" />
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-white relative" />
              ) : (
                <Menu className="w-5 h-5 text-secondary relative" />
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile Menu — Fullscreen Overlay — OUTSIDE header to avoid stacking context issues */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden fixed inset-0 z-[55] overflow-y-auto overscroll-contain"
            style={{ background: "color-mix(in srgb, var(--color-secondary) 97%, transparent)" }}
          >
            {/* Close button — inside overlay so it's always clickable */}
            <button
              onClick={closeMenu}
              className="absolute top-5 right-4 sm:right-6 w-12 h-12 flex items-center justify-center z-10 rounded-xl bg-white/10"
              aria-label="Cerrar menú"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <div className="flex flex-col justify-center items-center min-h-full px-8 py-24">
              {/* Nav items with stagger */}
              <div className="space-y-3 w-full max-w-sm">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ delay: 0.1 + index * 0.06, duration: 0.4 }}
                  >
                    <Link
                      href={item.href}
                      onClick={closeMenu}
                      className="flex items-center justify-between py-4 px-6 text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition-all group"
                    >
                      <span className="text-2xl font-display font-semibold">{item.label}</span>
                      <ArrowUpRight className="w-5 h-5 text-white/20 group-hover:text-accent transition-colors" />
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="mt-8 w-full max-w-sm"
              >
                {clinic._meta?.bookingEnabled ? (
                  <Link
                    href="/reservar"
                    onClick={closeMenu}
                    className="btn-primary w-full text-center py-4"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3 text-lg">
                      Pedir Cita
                      <ArrowUpRight className="w-5 h-5" />
                    </span>
                  </Link>
                ) : (
                  <a
                    href={`https://wa.me/${clinic.whatsapp}?text=${encodeURIComponent(clinic.whatsappMessage)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={closeMenu}
                    className="btn-primary w-full text-center py-4"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3 text-lg">
                      Pedir Cita
                      <ArrowUpRight className="w-5 h-5" />
                    </span>
                  </a>
                )}
              </motion.div>

              {/* Phone + Social links at bottom */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-10 flex flex-col items-center gap-4"
              >
                <a
                  href={`tel:${clinic.phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-3 text-white/50 hover:text-white transition-colors"
                  aria-label="Llamar por teléfono"
                >
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">{clinic.phone}</span>
                </a>

                <div className="flex gap-3">
                  {clinic.social.instagram && (
                    <a href={clinic.social.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all" aria-label="Instagram">
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                  {clinic.social.facebook && (
                    <a href={clinic.social.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all" aria-label="Facebook">
                      <Facebook className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
