import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import path from "path"

// Mock fs/promises
const mockWriteFile = vi.fn()
const mockMkdir = vi.fn()
const mockRm = vi.fn()

vi.mock("fs/promises", () => ({
  writeFile: (...args: unknown[]) => mockWriteFile(...args),
  mkdir: (...args: unknown[]) => mockMkdir(...args),
  rm: (...args: unknown[]) => mockRm(...args),
}))

vi.mock("@/config/load-config", () => ({
  invalidateConfig: vi.fn(),
}))

import { POST, DELETE } from "../route"
import { NextRequest } from "next/server"

const TEST_SECRET = "test-deploy-secret"

function makeFormData(slug: string, config: string, files?: Record<string, Blob>) {
  const formData = new FormData()
  formData.set("slug", slug)
  formData.set("config", config)
  if (files) {
    for (const [key, blob] of Object.entries(files)) {
      formData.set(key, blob)
    }
  }
  return formData
}

function makePostRequest(formData: FormData, authHeader?: string) {
  const req = new NextRequest("http://localhost/api/deploy", {
    method: "POST",
    body: formData,
    headers: authHeader ? { authorization: authHeader } : {},
  })
  return req
}

function makeDeleteRequest(body: object, authHeader?: string) {
  return new NextRequest("http://localhost/api/deploy", {
    method: "DELETE",
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json",
      ...(authHeader ? { authorization: authHeader } : {}),
    },
  })
}

describe("deploy route", () => {
  beforeEach(() => {
    vi.stubEnv("DEPLOY_SECRET", TEST_SECRET)
    vi.stubEnv("SITES_DIR", "/tmp/test-sites")
    mockWriteFile.mockResolvedValue(undefined)
    mockMkdir.mockResolvedValue(undefined)
    mockRm.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  describe("POST", () => {
    it("returns 401 without auth", async () => {
      const formData = makeFormData("test", "{}")
      const res = await POST(makePostRequest(formData))
      expect(res.status).toBe(401)
    })

    it("returns 401 with wrong auth", async () => {
      const formData = makeFormData("test", "{}")
      const res = await POST(makePostRequest(formData, "Bearer wrong"))
      expect(res.status).toBe(401)
    })

    it("returns 400 for invalid slug", async () => {
      const formData = makeFormData("../evil", "{}")
      const res = await POST(makePostRequest(formData, `Bearer ${TEST_SECRET}`))
      expect(res.status).toBe(400)
    })

    it("returns 400 for slug with uppercase", async () => {
      const formData = makeFormData("BadSlug", "{}")
      const res = await POST(makePostRequest(formData, `Bearer ${TEST_SECRET}`))
      expect(res.status).toBe(400)
    })

    it("creates dirs and saves config for valid request", async () => {
      const config = JSON.stringify({ name: "Test" })
      const formData = makeFormData("test-clinic", config)
      const res = await POST(makePostRequest(formData, `Bearer ${TEST_SECRET}`))

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.url).toBe("https://test-clinic.romantechwebs.com")
      expect(mockMkdir).toHaveBeenCalled()
      expect(mockWriteFile).toHaveBeenCalledWith(
        expect.stringContaining("config.json"),
        config,
        "utf-8"
      )
    })

    it("skips files with path traversal attempts", async () => {
      const config = JSON.stringify({ name: "Test" })
      const formData = makeFormData("test-clinic", config, {
        "file:../../etc/passwd": new Blob(["malicious"]),
      })
      const res = await POST(makePostRequest(formData, `Bearer ${TEST_SECRET}`))

      expect(res.status).toBe(200)
      // Should NOT have written the traversal file — only config.json
      const writeFileCalls = mockWriteFile.mock.calls
      const writtenPaths = writeFileCalls.map((c: unknown[]) => c[0] as string)
      expect(writtenPaths.every((p: string) => !p.includes("etc/passwd"))).toBe(true)
    })

    it("saves valid uploaded files", async () => {
      const config = JSON.stringify({ name: "Test" })
      const formData = makeFormData("test-clinic", config, {
        "file:images/hero.webp": new Blob(["image-data"]),
      })
      const res = await POST(makePostRequest(formData, `Bearer ${TEST_SECRET}`))

      expect(res.status).toBe(200)
      // Should have written hero.webp
      const writeFileCalls = mockWriteFile.mock.calls
      const writtenPaths = writeFileCalls.map((c: unknown[]) => c[0] as string)
      expect(writtenPaths.some((p: string) => p.includes("images/hero.webp"))).toBe(true)
    })
  })

  describe("DELETE", () => {
    it("returns 401 without auth", async () => {
      const res = await DELETE(makeDeleteRequest({ slug: "test" }))
      expect(res.status).toBe(401)
    })

    it("returns 400 for invalid slug", async () => {
      const res = await DELETE(makeDeleteRequest({ slug: "../evil" }, `Bearer ${TEST_SECRET}`))
      expect(res.status).toBe(400)
    })

    it("deletes directory for valid slug", async () => {
      const res = await DELETE(makeDeleteRequest({ slug: "test-clinic" }, `Bearer ${TEST_SECRET}`))
      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(mockRm).toHaveBeenCalled()
    })
  })
})
