"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Linkedin, ArrowUpRight, ChevronDown } from "lucide-react"
import { useClinic } from "@/config/clinic-context"
import { useOpenStatus } from "@/lib/use-open-status"
import { cn } from "@/lib/utils"

const TikTokIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
)

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

function MobileAccordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="border-t border-white/10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 text-sm font-bold uppercase tracking-wider text-white/40 hover:text-white/60 transition-colors"
        aria-expanded={isOpen}
      >
        {title}
        <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
      </button>
      <div className={cn("overflow-hidden transition-all duration-300", isOpen ? "max-h-96 pb-4" : "max-h-0")}>
        {children}
      </div>
    </div>
  )
}

export function Footer() {
  const clinic = useClinic()
  const openStatus = useOpenStatus(clinic.schedule)
  const currentYear = new Date().getFullYear()
  const whatsappUrl = `https://wa.me/${clinic.whatsapp}?text=${encodeURIComponent(clinic.whatsappMessage)}`

  return (
    <footer className="bg-secondary text-white relative overflow-hidden">
      {clinic.theme !== 'luxury' && <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px]" />}
      <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />

      {/* Mobile Footer */}
      <div className="lg:hidden container-wide px-4 py-10 relative">
        {/* Brand + socials + CTA */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            {clinic.logo ? (
              <Image src={clinic.logo} alt={clinic.name} width={40} height={40} className="rounded-xl shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-sm tracking-tight shrink-0">
                {clinic.name.split(/\s+/).filter(w => w.length > 2).slice(0, 3).map(w => w[0].toUpperCase()).join("")}
              </div>
            )}
            <span className="text-lg font-bold tracking-tight">{clinic.name}</span>
          </div>
          {openStatus && (
            <div className="flex items-center justify-center gap-2 text-sm mb-3">
              <span className={cn("relative flex h-2 w-2", openStatus.isOpen && "animate-pulse")}>
                {openStatus.isOpen && <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />}
                <span className={cn("relative inline-flex rounded-full h-2 w-2", openStatus.isOpen ? "bg-emerald-400" : "bg-red-400")} />
              </span>
              <span className={cn("font-medium", openStatus.isOpen ? "text-emerald-400" : "text-red-400/80")}>
                {openStatus.label}
              </span>
            </div>
          )}

          {/* Social links */}
          <div className="flex justify-center gap-3 mb-6">
            {clinic.social.instagram && (
              <a href={clinic.social.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500 transition-all duration-300" aria-label="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
            )}
            {clinic.social.facebook && (
              <a href={clinic.social.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-[#1877F2] transition-all duration-300" aria-label="Facebook">
                <Facebook className="w-4 h-4" />
              </a>
            )}
            {clinic.social.linkedin && (
              <a href={clinic.social.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-[#0077B5] transition-all duration-300" aria-label="LinkedIn">
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {clinic.social.tiktok && (
              <a href={clinic.social.tiktok} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-black hover:ring-1 hover:ring-white/20 transition-all duration-300" aria-label="TikTok">
                <TikTokIcon />
              </a>
            )}
          </div>

          {/* WhatsApp CTA */}
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 w-full max-w-xs px-6 py-3 bg-[#25D366] text-white font-bold rounded-xl hover:bg-[#20bd5a] transition-colors">
            <WhatsAppIcon className="w-5 h-5" />
            Contactar por WhatsApp
          </a>
        </div>

        {/* Accordion sections */}
        <MobileAccordion title="Contacto">
          <div className="space-y-3">
            <a href={`tel:${clinic.phone.replace(/\s/g, "")}`} className="flex items-center gap-3 text-white/70 text-sm">
              <Phone className="w-4 h-4 shrink-0" /> {clinic.phone}
            </a>
            {clinic.email && (
              <a href={`mailto:${clinic.email}`} className="flex items-center gap-3 text-white/70 text-sm">
                <Mail className="w-4 h-4 shrink-0" /> {clinic.email}
              </a>
            )}
            <a href={clinic.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 text-white/70 text-sm">
              <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{clinic.address.street}, {clinic.address.postalCode} {clinic.address.city}</span>
            </a>
          </div>
        </MobileAccordion>

        <MobileAccordion title="Horario">
          <ul className="space-y-2">
            {clinic.schedule.map((item, index) => (
              <li key={index} className="flex items-center gap-3 text-white/70 text-sm">
                <Clock className="w-4 h-4 shrink-0" />
                <span><span className="text-white/90 font-medium">{item.days}:</span> {item.hours}</span>
              </li>
            ))}
          </ul>
        </MobileAccordion>

        <MobileAccordion title="Legal">
          <ul className="space-y-2">
            {[
              { label: "Aviso Legal", href: "/aviso-legal" },
              { label: "Política de Privacidad", href: "/privacidad" },
              { label: "Política de Cookies", href: "/cookies" },
            ].map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-white/70 hover:text-white transition-colors text-sm">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </MobileAccordion>

        {/* Copyright */}
        <div className="mt-6 pt-6 border-t border-white/10 text-center text-xs text-white/30">
          <p>&copy; {currentYear} {clinic.legal.companyName}</p>
        </div>
      </div>

      {/* Desktop Footer */}
      <div className="hidden lg:block container-wide section-padding relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center gap-3">
              {clinic.logo ? (
                <Image src={clinic.logo} alt={clinic.name} width={44} height={44} className="rounded-xl shrink-0" />
              ) : (
                <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-sm tracking-tight shrink-0">
                  {clinic.name.split(/\s+/).filter(w => w.length > 2).slice(0, 3).map(w => w[0].toUpperCase()).join("")}
                </div>
              )}
              <div>
                <span className="text-xl font-bold tracking-tight">{clinic.name}</span>
                <p className="text-[10px] uppercase tracking-[0.15em] text-white/40">{clinic.tagline}</p>
              </div>
            </div>
            <p className="text-white/60 leading-relaxed">{clinic.tagline}</p>
            {openStatus && (
              <div className="flex items-center gap-2 text-sm">
                <span className={cn(
                  "relative flex h-2.5 w-2.5",
                  openStatus.isOpen && "animate-pulse"
                )}>
                  {openStatus.isOpen && (
                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                  )}
                  <span className={cn(
                    "relative inline-flex rounded-full h-2.5 w-2.5",
                    openStatus.isOpen ? "bg-emerald-400" : "bg-red-400"
                  )} />
                </span>
                <span className={cn(
                  "font-medium",
                  openStatus.isOpen ? "text-emerald-400" : "text-red-400/80"
                )}>
                  {openStatus.label}
                </span>
              </div>
            )}
            <div className="flex gap-3">
              {clinic.social.instagram && (
                <a href={clinic.social.instagram} target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500 transition-all duration-300" aria-label="Instagram">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {clinic.social.facebook && (
                <a href={clinic.social.facebook} target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center hover:bg-[#1877F2] transition-all duration-300" aria-label="Facebook">
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {clinic.social.linkedin && (
                <a href={clinic.social.linkedin} target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center hover:bg-[#0077B5] transition-all duration-300" aria-label="LinkedIn">
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {clinic.social.tiktok && (
                <a href={clinic.social.tiktok} target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center hover:bg-black hover:ring-1 hover:ring-white/20 transition-all duration-300" aria-label="TikTok">
                  <TikTokIcon />
                </a>
              )}
            </div>
          </div>

          {/* Contact Column */}
          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white/40">Contacto</h4>
            <ul className="space-y-4">
              <li>
                <a href={`tel:${clinic.phone.replace(/\s/g, "")}`} className="flex items-center gap-4 text-white/70 hover:text-white hover:translate-x-1 transition-all duration-300 group">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span>{clinic.phone}</span>
                </a>
              </li>
              {clinic.email && (
              <li>
                <a href={`mailto:${clinic.email}`} className="flex items-center gap-4 text-white/70 hover:text-white hover:translate-x-1 transition-all duration-300 group">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="text-sm">{clinic.email}</span>
                </a>
              </li>
              )}
              <li>
                <a href={clinic.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 text-white/70 hover:text-white hover:translate-x-1 transition-all duration-300 group">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="text-sm leading-relaxed">
                    {clinic.address.street}<br />
                    {clinic.address.postalCode} {clinic.address.city}
                  </span>
                </a>
              </li>
            </ul>
          </div>

          {/* Schedule Column */}
          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white/40">Horario</h4>
            <ul className="space-y-4">
              {clinic.schedule.map((item, index) => (
                <li key={index} className="flex items-start gap-4 text-white/70">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="text-sm">
                    <span className="block text-white/90 font-medium">{item.days}</span>
                    <span className="text-white/50">{item.hours}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white/40">Legal</h4>
            <ul className="space-y-3">
              {[
                { label: "Aviso Legal", href: "/aviso-legal" },
                { label: "Política de Privacidad", href: "/privacidad" },
                { label: "Política de Cookies", href: "/cookies" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors group">
                    {item.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/40">
          <p>&copy; {currentYear} {clinic.legal.companyName}</p>
          {clinic.legal.cif && <p>CIF: {clinic.legal.cif}</p>}
        </div>
      </div>
    </footer>
  )
}
