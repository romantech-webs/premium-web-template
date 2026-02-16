import Link from "next/link"
import Image from "next/image"
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Linkedin, ArrowUpRight } from "lucide-react"
import { clinic } from "@/config/clinic"

const TikTokIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
)

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-secondary text-white relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px]" />

      {/* Top accent line */}
      <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />

      <div className="container-wide section-padding relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center gap-3">
              {clinic.logo ? (
                <Image
                  src={clinic.logo}
                  alt={clinic.name}
                  width={44}
                  height={44}
                  className="rounded-xl shrink-0"
                />
              ) : (
                <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {clinic.name.charAt(0)}
                </div>
              )}
              <div>
                <span className="text-xl font-bold tracking-tight">
                  {clinic.name}
                </span>
                <p className="text-[10px] uppercase tracking-[0.15em] text-white/40">
                  {clinic.tagline}
                </p>
              </div>
            </div>
            <p className="text-white/60 leading-relaxed">
              {clinic.tagline}
            </p>

            {/* Social Links */}
            <div className="flex gap-3">
              {clinic.social.instagram && (
                <a
                  href={clinic.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center hover:bg-accent transition-colors duration-300"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {clinic.social.facebook && (
                <a
                  href={clinic.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center hover:bg-accent transition-colors duration-300"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {clinic.social.linkedin && (
                <a
                  href={clinic.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center hover:bg-accent transition-colors duration-300"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {clinic.social.tiktok && (
                <a
                  href={clinic.social.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center hover:bg-accent transition-colors duration-300"
                  aria-label="TikTok"
                >
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
                <a
                  href={`tel:${clinic.phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-4 text-white/70 hover:text-white transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span>{clinic.phone}</span>
                </a>
              </li>
              {clinic.email && (
              <li>
                <a
                  href={`mailto:${clinic.email}`}
                  className="flex items-center gap-4 text-white/70 hover:text-white transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="text-sm">{clinic.email}</span>
                </a>
              </li>
              )}
              <li>
                <a
                  href={clinic.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 text-white/70 hover:text-white transition-colors group"
                >
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
                  <Link
                    href={item.href}
                    className="flex items-center gap-2 text-white/70 hover:text-white transition-colors group"
                  >
                    {item.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/40">
          <p>
            &copy; {currentYear} {clinic.legal.companyName}
          </p>
          {clinic.legal.cif && (
            <p>CIF: {clinic.legal.cif}</p>
          )}
        </div>
      </div>
    </footer>
  )
}
