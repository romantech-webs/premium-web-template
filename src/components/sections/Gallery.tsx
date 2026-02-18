"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { X } from "lucide-react"
import { useClinic } from "@/config/clinic-context"
import { cn } from "@/lib/utils"

function GalleryPlaceholder({ alt, dark }: { alt: string; dark?: boolean }) {
  return (
    <div className={cn(
      "absolute inset-0 flex items-center justify-center",
      dark
        ? "bg-gradient-to-br from-white/5 to-white/10"
        : "bg-gradient-to-br from-primary/10 to-accent/10"
    )}>
      <div className="text-center p-4">
        <span className="text-4xl mb-2 block">📷</span>
        <p className={cn("text-xs", dark ? "text-white/40" : "text-primary/50")}>{alt}</p>
      </div>
    </div>
  )
}

function GalleryImageWithFallback({
  src,
  alt,
  sizes,
  contain,
}: {
  src: string
  alt: string
  sizes: string
  contain?: boolean
}) {
  const [error, setError] = useState(false)

  if (error || !src || src.includes("placeholder")) {
    return <GalleryPlaceholder alt={alt} dark={contain} />
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={contain ? "object-contain" : "object-cover group-hover:scale-105 transition-transform duration-700 ease-out"}
      sizes={sizes}
      onError={() => setError(true)}
    />
  )
}

export function Gallery() {
  const clinic = useClinic()
  const images = clinic.gallery
  const total = images.length
  // Last image becomes a full-width panoramic only when middle images pair evenly
  const lastIsFeature = total >= 4 && (total - 2) % 2 === 0
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const closeLightbox = useCallback(() => setLightboxIndex(null), [])

  return (
    <section className="section-padding bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

      <div className="container-wide relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="section-label justify-center">{clinic.sectionCopy.galleryLabel}</span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-secondary mt-4 mb-6">
            {clinic.sectionCopy.galleryTitle}
          </h2>
          <p className="text-xl text-secondary/60 leading-relaxed">
            {clinic.sectionCopy.galleryDescription}
          </p>
        </motion.div>

        {/* Bento Gallery Grid */}
        <div className="grid md:grid-cols-2 gap-3 md:gap-5">
          {images.map((image, index) => {
            const isFirst = index === 0
            const isLast = index === total - 1
            const isFeature = isFirst || (isLast && lastIsFeature)

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={cn("group relative cursor-pointer", isFeature && "md:col-span-2")}
                onClick={() => setLightboxIndex(index)}
              >
                <div
                  className={cn(
                    "relative overflow-hidden rounded-2xl",
                    isFirst
                      ? "aspect-[16/10]"
                      : isLast && lastIsFeature
                        ? "aspect-[21/9]"
                        : "aspect-[4/3]"
                  )}
                >
                  <GalleryImageWithFallback
                    src={image.src}
                    alt={image.alt}
                    sizes={
                      isFeature
                        ? "(max-width: 768px) 100vw, 100vw"
                        : "(max-width: 768px) 100vw, 50vw"
                    }
                  />

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary/60 via-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Caption */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                    <p className="text-white font-medium text-sm tracking-wide">{image.alt}</p>
                  </div>

                  {/* Index marker — always visible at reduced opacity, full on hover */}
                  <div className="absolute top-4 left-4 w-8 h-8 rounded-full border border-white/20 backdrop-blur-sm flex items-center justify-center opacity-30 group-hover:opacity-100 group-hover:bg-white/10 transition-all duration-300">
                    <span className="text-white/90 text-xs font-bold">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeLightbox}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 z-10 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Image */}
            <motion.div
              className="relative max-w-5xl w-full max-h-[85vh] aspect-[4/3]"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <GalleryImageWithFallback
                src={images[lightboxIndex].src}
                alt={images[lightboxIndex].alt}
                sizes="100vw"
                contain
              />

              {/* Caption */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                <p className="text-white text-sm text-center">
                  {images[lightboxIndex].alt}
                  <span className="text-white/50 ml-2">
                    {lightboxIndex + 1} / {total}
                  </span>
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
