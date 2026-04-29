import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir, rm } from "fs/promises"
import path from "path"
import { invalidateConfig } from "@/config/load-config"

const SITES_DIR = process.env.SITES_DIR || "/var/www/sites"
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB per file
const MAX_TOTAL_SIZE = 50 * 1024 * 1024 // 50MB total

export async function POST(request: NextRequest) {
  const secret = process.env.DEPLOY_SECRET
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Check Content-Length before parsing
  const contentLength = parseInt(request.headers.get("content-length") || "0", 10)
  if (contentLength > MAX_TOTAL_SIZE) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 })
  }

  const formData = await request.formData()
  const slug = formData.get("slug") as string
  const configRaw = formData.get("config") as string

  if (!slug || !configRaw || !/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const siteDir = path.resolve(SITES_DIR, slug)
  // Validate siteDir is inside SITES_DIR
  if (!siteDir.startsWith(path.resolve(SITES_DIR) + path.sep)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 })
  }

  await mkdir(path.join(siteDir, "images", "gallery"), { recursive: true })
  await mkdir(path.join(siteDir, "images", "team"), { recursive: true })

  // Save config
  await writeFile(path.join(siteDir, "config.json"), configRaw, "utf-8")

  // Save uploaded files (photos, OG image)
  let totalSize = 0
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("file:") && value instanceof Blob) {
      // Validate file size
      if (value.size > MAX_FILE_SIZE) continue
      totalSize += value.size
      if (totalSize > MAX_TOTAL_SIZE) {
        return NextResponse.json({ error: "Total upload size exceeded" }, { status: 413 })
      }

      const filePath = key.replace("file:", "")
      // Prevent path traversal with resolve check
      const fullPath = path.resolve(siteDir, filePath)
      if (!fullPath.startsWith(siteDir + path.sep)) continue

      await mkdir(path.dirname(fullPath), { recursive: true })
      await writeFile(fullPath, Buffer.from(await value.arrayBuffer()))
    }
  }

  invalidateConfig(slug)
  return NextResponse.json({ success: true, url: `https://${slug}.romantechwebs.com` })
}

export async function DELETE(request: NextRequest) {
  const secret = process.env.DEPLOY_SECRET
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { slug } = await request.json()
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 })
  }

  await rm(path.join(SITES_DIR, slug), { recursive: true, force: true })
  invalidateConfig(slug)
  return NextResponse.json({ success: true })
}

export async function PATCH(request: NextRequest) {
  const secret = process.env.DEPLOY_SECRET
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { slug, meta } = await request.json()
  if (!slug || !/^[a-z0-9-]+$/.test(slug) || !meta || typeof meta !== "object") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const siteDir = path.resolve(SITES_DIR, slug)
  if (!siteDir.startsWith(path.resolve(SITES_DIR) + path.sep)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 })
  }

  const configPath = path.join(siteDir, "config.json")
  try {
    const { readFile } = await import("fs/promises")
    const raw = await readFile(configPath, "utf-8")
    const config = JSON.parse(raw)
    config._meta = { ...config._meta, ...meta }
    await writeFile(configPath, JSON.stringify(config, null, 2), "utf-8")
    invalidateConfig(slug)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Site not found" }, { status: 404 })
  }
}
