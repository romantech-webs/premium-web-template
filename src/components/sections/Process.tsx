"use client"

import { motion } from "framer-motion"
import { clinic } from "@/config/clinic"

export function Process() {
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
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            {clinic.sectionCopy.processLabel}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-secondary mt-4 mb-6">
            {clinic.sectionCopy.processTitle}
          </h2>
          <p className="text-lg text-secondary/70">
            {clinic.sectionCopy.processDescription}
          </p>
        </motion.div>

        {/* Process Steps */}
        <div className="relative">
          {/* Connection line - desktop */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20 -translate-y-1/2" />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {clinic.process.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative"
              >
                {/* Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow relative z-10">
                  {/* Step number */}
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-display font-bold text-lg mb-5 shadow-lg shadow-primary/30">
                    {step.step}
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
