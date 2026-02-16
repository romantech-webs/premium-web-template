"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { MapPin, Clock, Phone, Mail, Send, CheckCircle } from "lucide-react"
import { clinic } from "@/config/clinic"

export default function ContactoPage() {
  const [formState, setFormState] = useState({
    nombre: "",
    email: "",
    telefono: "",
    mensaje: "",
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const apiUrl = (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).__WIDGET_API_URL) as string | undefined
      if (!apiUrl) {
        setIsSubmitted(true)
        return
      }
      const projectId = (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).__PROJECT_ID) as string | undefined
      const res = await fetch(`${apiUrl}/api/widget/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: projectId || '',
          type: 'contact',
          name: formState.nombre,
          email: formState.email,
          phone: formState.telefono,
          message: formState.mensaje,
        }),
      })
      if (!res.ok) throw new Error('Error al enviar')
      setIsSubmitted(true)
    } catch {
      setSubmitError('Error al enviar el mensaje. Por favor, inténtalo de nuevo o contacta por WhatsApp.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="section-padding bg-neutral">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-secondary mb-6">
              Contacta con nosotros
            </h1>
            <p className="text-lg text-secondary/70">
              Estamos aquí para ayudarte. Ponte en contacto con nosotros y te responderemos
              lo antes posible.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section-padding bg-white">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-display font-bold text-secondary mb-6">
                Envíanos un mensaje
              </h2>

              {isSubmitted ? (
                <div className="bg-accent/10 rounded-2xl p-8 text-center">
                  <CheckCircle className="w-16 h-16 text-accent mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-secondary mb-2">
                    ¡Mensaje enviado!
                  </h3>
                  <p className="text-secondary/70">
                    Gracias por contactar con nosotros. Te responderemos en menos de 24 horas.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="nombre"
                      className="block text-sm font-medium text-secondary mb-2"
                    >
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={formState.nombre}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="Tu nombre"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-secondary mb-2"
                      >
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formState.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        placeholder="tu@email.com"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="telefono"
                        className="block text-sm font-medium text-secondary mb-2"
                      >
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        id="telefono"
                        name="telefono"
                        value={formState.telefono}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        placeholder="+34 XXX XXX XXX"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="mensaje"
                      className="block text-sm font-medium text-secondary mb-2"
                    >
                      Mensaje *
                    </label>
                    <textarea
                      id="mensaje"
                      name="mensaje"
                      value={formState.mensaje}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                      placeholder="¿En qué podemos ayudarte?"
                    />
                  </div>

                  <div className="text-xs text-secondary/50">
                    Al enviar este formulario aceptas nuestra{" "}
                    <a href="/privacidad" className="text-primary hover:underline">
                      política de privacidad
                    </a>
                    .
                  </div>

                  {submitError && (
                    <p className="text-sm text-red-600">{submitError}</p>
                  )}
                  <button type="submit" className="btn-primary w-full sm:w-auto" disabled={isSubmitting}>
                    <Send className="w-4 h-4" />
                    {isSubmitting ? 'Enviando...' : 'Enviar mensaje'}
                  </button>
                </form>
              )}
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-8"
            >
              <h2 className="text-2xl font-display font-bold text-secondary mb-6">
                Información de contacto
              </h2>

              <div className="space-y-6">
                {/* Phone */}
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary">Teléfono</h3>
                    <a
                      href={`tel:${clinic.phone.replace(/\s/g, "")}`}
                      className="text-secondary/70 hover:text-primary transition-colors"
                    >
                      {clinic.phone}
                    </a>
                  </div>
                </div>

                {/* Email */}
                {clinic.email && (
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary">Email</h3>
                    <a
                      href={`mailto:${clinic.email}`}
                      className="text-secondary/70 hover:text-primary transition-colors"
                    >
                      {clinic.email}
                    </a>
                  </div>
                </div>
                )}

                {/* Address */}
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary">Dirección</h3>
                    <p className="text-secondary/70">
                      {clinic.address.street}<br />
                      {clinic.address.postalCode} {clinic.address.city}
                    </p>
                  </div>
                </div>

                {/* Schedule */}
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary">Horario</h3>
                    <ul className="text-secondary/70">
                      {clinic.schedule.map((item, index) => (
                        <li key={index}>
                          {item.days}: {item.hours}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* WhatsApp CTA */}
              <div className="bg-[#25D366]/10 rounded-2xl p-6">
                <h3 className="font-semibold text-secondary mb-2">
                  ¿Prefieres WhatsApp?
                </h3>
                <p className="text-secondary/70 text-sm mb-4">
                  Escríbenos directamente y te responderemos en minutos.
                </p>
                <a
                  href={`https://wa.me/${clinic.whatsapp}?text=${encodeURIComponent(clinic.whatsappMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp w-full justify-center"
                >
                  Abrir WhatsApp
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="h-[400px] bg-neutral">
        {clinic.googleMapsEmbed && clinic.googleMapsEmbed !== "TODO: URL embed" ? (
          <iframe
            src={clinic.googleMapsEmbed}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Ubicación de la clínica"
          />
        ) : (
          <div className="h-full flex items-center justify-center text-secondary/30">
            <div className="text-center">
              <MapPin className="w-16 h-16 mx-auto mb-4" />
              <p className="text-sm">Configura googleMapsEmbed en /config/clinic.ts</p>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
