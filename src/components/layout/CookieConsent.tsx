"use client"

import { useState, useEffect } from "react"

type ConsentState = "pending" | "accepted" | "rejected"

const STORAGE_KEY = "cookie-consent"

export function CookieConsent() {
  const [state, setState] = useState<ConsentState>("pending")
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === "accepted" || saved === "rejected") {
      setState(saved)
      if (saved === "accepted") activateTracking()
    } else {
      // Show banner after the user starts interacting (avoids covering LCP
      // element on first viewport). Triggers on first scroll or after 4s.
      let armed = true
      const show = () => {
        if (!armed) return
        armed = false
        setVisible(true)
      }
      const onScroll = () => { if (window.scrollY > 60) show() }
      window.addEventListener("scroll", onScroll, { passive: true })
      const t = setTimeout(show, 4000)
      return () => {
        clearTimeout(t)
        window.removeEventListener("scroll", onScroll)
      }
    }
  }, [])

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted")
    setState("accepted")
    setVisible(false)
    activateTracking()
  }

  function reject() {
    localStorage.setItem(STORAGE_KEY, "rejected")
    setState("rejected")
    setVisible(false)
  }

  if (!visible || state !== "pending") return null

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 99990,
        padding: "16px",
        background: "rgba(0,0,0,0.9)",
        backdropFilter: "blur(8px)",
        color: "white",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        fontSize: "14px",
        lineHeight: "1.5",
      }}
    >
      <p style={{ margin: 0, maxWidth: "600px", textAlign: "center" }}>
        Utilizamos cookies de análisis para mejorar tu experiencia.{" "}
        <a href="/cookies" style={{ color: "var(--color-primary, #60a5fa)", textDecoration: "underline" }}>
          Más información
        </a>
      </p>
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={reject}
          style={{
            padding: "8px 20px",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.3)",
            background: "transparent",
            color: "white",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          Solo necesarias
        </button>
        <button
          onClick={accept}
          style={{
            padding: "8px 20px",
            borderRadius: "8px",
            border: "none",
            background: "var(--color-primary, #2563eb)",
            color: "white",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          Aceptar todas
        </button>
      </div>
    </div>
  )
}

/**
 * Activate tracking scripts that were blocked until consent.
 * Finds script tags with type="text/plain" data-consent="analytics" and enables them.
 */
function activateTracking() {
  document.querySelectorAll('script[type="text/plain"][data-consent="analytics"]').forEach((el) => {
    const script = document.createElement("script")
    if (el.getAttribute("src")) {
      script.src = el.getAttribute("src")!
      script.async = true
    } else {
      script.textContent = el.textContent
    }
    el.parentNode?.replaceChild(script, el)
  })
}

/**
 * Check if user has accepted cookies (for use in layout.tsx server component).
 * This is a client-side only check — always returns false on server.
 */
export function hasConsent(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(STORAGE_KEY) === "accepted"
}
