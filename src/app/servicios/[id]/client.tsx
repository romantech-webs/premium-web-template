"use client"

import { motion } from "framer-motion"
import { CheckCircle, ArrowRight, Phone } from "lucide-react"
import Link from "next/link"

interface ServicePageClientProps {
  service: {
    name: string
    description: string
    longDescription?: string
    benefits: string[]
  }
  relatedFaqs: Array<{ question: string; answer: string }>
  clinicName: string
  bookingEnabled: boolean
  whatsapp: string
  whatsappMessage: string
  phone: string
}

export function ServicePageClient({
  service,
  relatedFaqs,
  clinicName,
  bookingEnabled,
  whatsapp,
  whatsappMessage,
  phone,
}: ServicePageClientProps) {
  const whatsappUrl = `https://wa.me/${whatsapp}?text=${encodeURIComponent(whatsappMessage)}`

  return (
    <>
      {/* Benefits */}
      <section className="section-padding bg-white">
        <div className="container-wide max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-secondary mb-8">
              Beneficios
            </h2>
            <ul className="grid sm:grid-cols-2 gap-4">
              {service.benefits.map((benefit, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3 p-4 bg-neutral rounded-xl"
                >
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-secondary/80">{benefit}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Related FAQs (if any) */}
      {relatedFaqs.length > 0 && (
        <section className="section-padding bg-neutral">
          <div className="container-wide max-w-4xl">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-secondary mb-8">
              Preguntas frecuentes
            </h2>
            <div className="space-y-4">
              {relatedFaqs.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-xl p-6"
                >
                  <h3 className="font-semibold text-secondary mb-2">{faq.question}</h3>
                  <p className="text-secondary/70 leading-relaxed">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="section-padding bg-white">
        <div className="container-wide max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-secondary to-secondary/90 rounded-2xl p-8 sm:p-12 text-center"
          >
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-4">
              {`¿Necesitas ${service.name.toLowerCase()}?`}
            </h2>
            <p className="text-white/70 mb-8 max-w-xl mx-auto">
              {`Pide tu cita en ${clinicName} y nuestro equipo te atenderá de forma personalizada.`}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {bookingEnabled ? (
                <Link
                  href="/reservar"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-secondary font-bold rounded-xl hover:bg-accent hover:text-white transition-all duration-300"
                >
                  Reservar cita online
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-secondary font-bold rounded-xl hover:bg-accent hover:text-white transition-all duration-300"
                >
                  Pedir cita por WhatsApp
                  <ArrowRight className="w-4 h-4" />
                </a>
              )}
              <a
                href={`tel:${phone.replace(/\s/g, "")}`}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-bold rounded-xl hover:bg-white/10 transition-all duration-300"
              >
                <Phone className="w-4 h-4" />
                {phone}
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
