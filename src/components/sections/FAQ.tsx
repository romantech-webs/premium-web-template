"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { useClinic } from "@/config/clinic-context"
import { cn } from "@/lib/utils"

export function FAQ() {
  const clinic = useClinic()
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="section-padding bg-neutral">
      <div className="container-narrow">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <span className="section-label justify-center">
            {clinic.sectionCopy.faqLabel}
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-secondary mt-4 mb-6">
            {clinic.sectionCopy.faqTitle}
          </h2>
          <p className="text-xl text-secondary/60 leading-relaxed">
            {clinic.sectionCopy.faqDescription}
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="space-y-4"
        >
          {clinic.faq.map((item, index) => (
            <div
              key={index}
              className={cn(
                "bg-white rounded-2xl overflow-hidden transition-all duration-300",
                openIndex === index
                  ? "shadow-lg border-l-4 border-l-primary"
                  : "shadow-sm border-l-4 border-l-transparent"
              )}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="font-semibold text-secondary pr-4 flex items-center">
                  <span className="text-primary/20 font-mono mr-3">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {item.question}
                </span>
                <ChevronDown
                  className={cn(
                    "w-5 h-5 text-primary flex-shrink-0 transition-transform",
                    openIndex === index && "rotate-180"
                  )}
                />
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  >
                    <div className="px-6 pb-6 text-secondary/70 pl-[4.25rem]">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-secondary/60 mb-4">
            ¿No encuentras lo que buscas?
          </p>
          <a
            href={`https://wa.me/${clinic.whatsapp}?text=${encodeURIComponent(clinic.whatsappMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            <span className="relative z-10">Pregúntanos por WhatsApp</span>
          </a>
        </motion.div>
      </div>
    </section>
  )
}
