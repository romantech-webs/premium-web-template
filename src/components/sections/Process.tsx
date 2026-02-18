"use client"

import { motion } from "framer-motion"
import { useClinic } from "@/config/clinic-context"

export function Process() {
  const clinic = useClinic()

  return (
    <section className="section-padding bg-neutral">
      <div className="container-wide">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="section-label justify-center">
            {clinic.sectionCopy.processLabel}
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-secondary mt-4 mb-6">
            {clinic.sectionCopy.processTitle}
          </h2>
          <p className="text-xl text-secondary/60 leading-relaxed">
            {clinic.sectionCopy.processDescription}
          </p>
        </motion.div>

        {/* Process Steps */}
        <div className="relative">
          {/* Connection line - desktop, animated */}
          <motion.div
            className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 origin-left"
            style={{ background: "linear-gradient(90deg, color-mix(in srgb, var(--color-primary) 20%, transparent), var(--color-primary), color-mix(in srgb, var(--color-primary) 20%, transparent))" }}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {clinic.process.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="relative"
              >
                {/* Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-primary/20 border border-transparent transition-all duration-300 relative z-10 hover:shadow-[0_20px_40px_-10px_color-mix(in_srgb,var(--color-primary)_15%,transparent)]">
                  {/* Step number with pulse ring */}
                  <div className="relative w-12 h-12 mb-5">
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      animate={{
                        boxShadow: [
                          "0 0 0 0px color-mix(in srgb, var(--color-primary) 30%, transparent)",
                          "0 0 0 10px color-mix(in srgb, var(--color-primary) 0%, transparent)"
                        ]
                      }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay: index * 0.4 }}
                    />
                    <div className="relative w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-display font-bold text-lg shadow-lg shadow-primary/30">
                      {step.step}
                    </div>
                  </div>

                  <h3 className="text-xl font-display font-semibold text-secondary mb-3">
                    {step.title}
                  </h3>
                  <p className="text-secondary/70">
                    {step.description}
                  </p>
                </div>

                {/* Arrow connector - mobile/tablet */}
                {index < clinic.process.length - 1 && (
                  <div className="lg:hidden flex justify-center py-4">
                    <svg
                      className="w-6 h-6 text-primary/30"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
