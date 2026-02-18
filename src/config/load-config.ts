import { readFile, stat } from "fs/promises"
import path from "path"
import type { ClinicConfig } from "./types"

const SITES_DIR = process.env.SITES_DIR || "/var/www/sites"
const cache = new Map<string, { config: ClinicConfig; ts: number }>()
const TTL = 300_000 // 5 minutes
const MAX_CONFIG_SIZE = 1024 * 1024 // 1MB

export async function getClinicConfig(slug: string): Promise<ClinicConfig | null> {
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) return null

  const cached = cache.get(slug)
  if (cached && Date.now() - cached.ts < TTL) return cached.config

  try {
    const configPath = path.join(SITES_DIR, slug, "config.json")
    const fileStats = await stat(configPath)
    if (fileStats.size > MAX_CONFIG_SIZE) {
      console.error(`[load-config] Config too large for slug "${slug}": ${fileStats.size} bytes`)
      return null
    }
    const raw = await readFile(configPath, "utf-8")
    const config: ClinicConfig = JSON.parse(raw)
    cache.set(slug, { config, ts: Date.now() })
    // Evict oldest if cache grows too large
    if (cache.size > 500) {
      const oldest = [...cache.entries()].sort((a, b) => a[1].ts - b[1].ts)[0]
      if (oldest) cache.delete(oldest[0])
    }
    return config
  } catch (err) {
    console.error(`[load-config] Failed to load config for slug "${slug}":`, err)
    return null
  }
}

export function invalidateConfig(slug: string) {
  cache.delete(slug)
}
