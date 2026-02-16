"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Phone, ArrowUpRight } from "lucide-react"
import { clinic } from "@/config/clinic"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Servicios", href: "/#servicios" },
  { label: "Equipo", href: "/#equipo" },
  { label: "Opiniones", href: "/#opiniones" },
  { label: "Ubicación", href: "/#ubicacion" },
  { label: "Contacto", href: "/contacto" },
]

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled
          ? "bg-white/95 backdrop-blur-xl shadow-lg shadow-black/5 py-3"
          : "bg-transparent py-6"
      )}
    >
      <div className="container-wide px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
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
                <div className="relative w-11 h-11 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-lg">
                  {clinic.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold tracking-tight text-secondary">
                {clinic.name}
              </span>
              <p className={cn(
                "text-[10px] uppercase tracking-[0.15em] transition-colors",
                isScrolled ? "text-secondary/50" : "text-secondary/60"
              )}>
                {clinic.tagline}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1 shrink-0">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative px-5 py-2 text-sm font-medium transition-colors group",
                  isScrolled ? "text-secondary/70 hover:text-secondary" : "text-secondary/70 hover:text-secondary"
                )}
              >
                {item.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-1/2" />
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <a
              href={`tel:${clinic.phone.replace(/\s/g, "")}`}
              className="flex items-center gap-2 text-sm font-semibold text-secondary/70 hover:text-primary transition-colors whitespace-nowrap"
            >
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4 text-primary" />
              </div>
              <span className="hidden xl:block">{clinic.phone}</span>
            </a>
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
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden relative w-12 h-12 flex items-center justify-center"
            aria-label="Toggle menu"
          >
            <div className="absolute inset-0 bg-secondary/5 rounded-xl" />
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-secondary relative" />
            ) : (
              <Menu className="w-5 h-5 text-secondary relative" />
            )}
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-gray-100 shadow-xl"
          >
            <div className="container-wide px-4 py-8 space-y-2">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between py-4 px-4 text-secondary hover:bg-neutral rounded-xl transition-colors group"
                  >
                    <span className="font-semibold">{item.label}</span>
                    <ArrowUpRight className="w-4 h-4 text-secondary/30 group-hover:text-accent transition-colors" />
                  </Link>
                </motion.div>
              ))}
              <div className="pt-6 space-y-3 border-t border-gray-100 mt-4">
                <a
                  href={`tel:${clinic.phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-3 py-3 px-4 text-secondary/70 hover:text-primary transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  {clinic.phone}
                </a>
                <a
                  href={`https://wa.me/${clinic.whatsapp}?text=${encodeURIComponent(clinic.whatsappMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp w-full text-center"
                >
                  Pedir Cita por WhatsApp
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
