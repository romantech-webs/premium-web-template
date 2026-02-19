"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
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
  const lastIsFeature = total >= 4 && (total - 2) % 2 === 0
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [mobileIndex, setMobileIndex] = useState(0)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  const closeLightbox = useCallback(() => setLightboxIndex(null), [])

  const goNext = useCallback(() => {
    if (lightboxIndex === null) return
    setLightboxIndex((lightboxIndex + 1) % total)
  }, [lightboxIndex, total])

  const goPrev = useCallback(() => {
    if (lightboxIndex === null) return
    setLightboxIndex((lightboxIndex - 1 + total) % total)
  }, [lightboxIndex, total])

  // Keyboard navigation
  useEffect(() => {
    if (lightboxIndex === null) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext()
      else if (e.key === "ArrowLeft") goPrev()
      else if (e.key === "Escape") closeLightbox()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [lightboxIndex, goNext, goPrev, closeLightbox])

  // Preload next image
  useEffect(() => {
    if (lightboxIndex === null) return
    const nextIndex = (lightboxIndex + 1) % total
    const img = new window.Image()
    img.src = images[nextIndex].src
  }, [lightboxIndex, images, total])

  // Touch events for lightbox swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext()
      else goPrev()
    }
  }

  // Mobile scroll tracking
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const handleScroll = () => {
      const scrollLeft = el.scrollLeft
      const cardWidth = el.firstElementChild?.clientWidth || 300
      const gap = 12
      setMobileIndex(Math.round(scrollLeft / (cardWidth + gap)))
    }
    el.addEventListener("scroll", handleScroll, { passive: true })
    return () => el.removeEventListener("scroll", handleScroll)
  }, [])

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
          className="text-center max-w-3xl mx-auto mb-10 lg:mb-16"
        >
          <span className="section-label justify-center">{clinic.sectionCopy.galleryLabel}</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-display font-bold text-secondary mt-4 mb-4 lg:mb-6">
            {clinic.sectionCopy.galleryTitle}
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-secondary/60 leading-relaxed">
            {clinic.sectionCopy.galleryDescription}
          </p>
        </motion.div>

        {/* Mobile: Horizontal scroll */}
        <div className="md:hidden">
          <div ref={scrollRef} className="carousel-snap gap-3 -mx-4 px-4 pb-4">
            {images.map((image, index) => (
              <div
                key={index}
                className="w-[85vw] max-w-[340px] cursor-pointer group"
                onClick={() => setLightboxIndex(index)}
              >
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                  <GalleryImageWithFallback
                    src={image.src}
                    alt={image.alt}
                    sizes="85vw"
                  />
                  {/* Counter overlay */}
                  <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/50 backdrop-blur-sm rounded-full">
                    <span className="text-white text-xs font-medium">{index + 1} / {total}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dot indicators */}
          <div className="flex justify-center gap-1.5 mt-3">
            {images.map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                style={{
                  background: "var(--color-primary)",
                  opacity: i === mobileIndex ? 1 : 0.2,
                  transform: i === mobileIndex ? "scale(1.5)" : "scale(1)",
                }}
              />
            ))}
          </div>
        </div>

        {/* Desktop: Bento Gallery Grid */}
        <div className="hidden md:grid md:grid-cols-2 gap-3 md:gap-5">
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
                transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className={cn("group relative cursor-pointer", isFeature && "md:col-span-2")}
                onClick={() => setLightboxIndex(index)}
              >
                <div className={cn(
                  "relative overflow-hidden rounded-2xl",
                  isFirst
                    ? "aspect-[16/10]"
                    : isLast && lastIsFeature
                      ? "aspect-[21/9]"
                      : "aspect-[4/3]"
                )}>
                  <GalleryImageWithFallback
                    src={image.src}
                    alt={image.alt}
                    sizes={isFeature ? "(max-width: 768px) 100vw, 100vw" : "(max-width: 768px) 100vw, 50vw"}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary/60 via-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                    <p className="text-white font-medium text-sm tracking-wide">{image.alt}</p>
                  </div>
                  <div className="absolute top-4 left-4 w-8 h-8 rounded-full border border-white/20 backdrop-blur-sm flex items-center justify-center opacity-30 group-hover:opacity-100 group-hover:bg-white/10 transition-all duration-300">
                    <span className="text-white/90 text-xs font-bold">{String(index + 1).padStart(2, "0")}</span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Professional Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeLightbox}
          >
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Counter */}
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full">
              <span className="text-white text-sm font-medium">{lightboxIndex + 1} / {total}</span>
            </div>

            {/* Prev/Next buttons — desktop */}
            <button
              onClick={(e) => { e.stopPropagation(); goPrev() }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 hidden sm:flex items-center justify-center hover:bg-white/20 transition-colors"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goNext() }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 hidden sm:flex items-center justify-center hover:bg-white/20 transition-colors"
              aria-label="Imagen siguiente"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>

            {/* Image with swipe support */}
            <motion.div
              key={lightboxIndex}
              className="relative max-w-5xl w-full max-h-[85vh] aspect-[4/3] mx-4 sm:mx-8"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <GalleryImageWithFallback
                src={images[lightboxIndex].src}
                alt={images[lightboxIndex].alt}
                sizes="100vw"
                contain
              />

              {/* Caption */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                <p className="text-white text-sm text-center">{images[lightboxIndex].alt}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
