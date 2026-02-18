"use client"

import { createContext, useContext } from "react"
import type { ClinicConfig } from "./types"

const ClinicContext = createContext<ClinicConfig | null>(null)

export function ClinicProvider({ config, children }: { config: ClinicConfig; children: React.ReactNode }) {
  return <ClinicContext.Provider value={config}>{children}</ClinicContext.Provider>
}

export function useClinic(): ClinicConfig {
  const ctx = useContext(ClinicContext)
  if (!ctx) throw new Error("useClinic must be used inside ClinicProvider")
  return ctx
}
