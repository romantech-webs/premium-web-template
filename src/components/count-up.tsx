"use client"

import { useEffect, useRef, useState } from "react"

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

interface CountUpProps {
  end: number
  prefix?: string
  suffix?: string
  decimals?: number
  duration?: number
  className?: string
}

export function CountUp({
  end,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 2000,
  className,
}: CountUpProps) {
  const [count, setCount] = useState(end)
  const ref = useRef<HTMLSpanElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el || hasAnimated.current) return

    // Small values with decimals (ratings like 5.0) don't animate — animation
    // captures mid-frames like 4.1 / 4.7 that look wrong vs the real rating.
    const shouldAnimate = end >= 10 && decimals === 0
    if (!shouldAnimate) {
      hasAnimated.current = true
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          setCount(0)
          const start = performance.now()

          function animate(now: number) {
            const elapsed = now - start
            const progress = Math.min(elapsed / duration, 1)
            const eased = easeOutExpo(progress)
            setCount(eased * end)

            if (progress < 1) {
              requestAnimationFrame(animate)
            } else {
              setCount(end)
            }
          }

          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [end, duration, decimals])

  const display = decimals > 0 ? count.toFixed(decimals) : Math.round(count).toString()

  return (
    <span ref={ref} className={className}>
      {prefix}{display}{suffix}
    </span>
  )
}
