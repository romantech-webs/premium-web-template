import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock fs/promises at module level
vi.mock("fs/promises", () => ({
  readFile: vi.fn(),
  stat: vi.fn(),
}))

const validConfig = {
  name: "Test Clinic",
  colors: { primary: "#4F46E5", secondary: "#1E293B", accent: "#10B981", neutral: "#F8FAFC" },
  seo: { titleTemplate: "%s | Test", defaultTitle: "Test", defaultDescription: "Desc", keywords: [], ogImage: "" },
  heroHeadline: ["Line1", "Line2", "Line3"],
  heroDescription: "Desc",
  phone: "+34612345678",
  whatsapp: "34612345678",
  whatsappMessage: "Hola",
  services: [],
  reviews: { rating: 4.5, count: 100, url: "", featured: [] },
  schedule: [{ days: "Lun-Vie", hours: "9-20" }],
  address: { street: "Calle", city: "Madrid", province: "Madrid", postalCode: "28001", country: "España" },
}

describe("load-config", () => {
  let getClinicConfig: typeof import("@/config/load-config").getClinicConfig
  let invalidateConfig: typeof import("@/config/load-config").invalidateConfig
  let mockReadFile: ReturnType<typeof vi.fn>
  let mockStat: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    // Reset modules to get a fresh cache in load-config
    vi.resetModules()

    const fsMock = await import("fs/promises")
    mockReadFile = fsMock.readFile as unknown as ReturnType<typeof vi.fn>
    mockStat = fsMock.stat as unknown as ReturnType<typeof vi.fn>
    // Clear accumulated calls from previous tests
    mockReadFile.mockClear()
    mockStat.mockClear()

    const mod = await import("@/config/load-config")
    getClinicConfig = mod.getClinicConfig
    invalidateConfig = mod.invalidateConfig
  })

  it("returns parsed ClinicConfig for valid slug", async () => {
    mockStat.mockResolvedValue({ size: 500 })
    mockReadFile.mockResolvedValue(JSON.stringify(validConfig))

    const config = await getClinicConfig("test-clinic")
    expect(config).not.toBeNull()
    expect(config!.name).toBe("Test Clinic")
  })

  it("returns null for slug with path traversal characters", async () => {
    const result = await getClinicConfig("../evil")
    expect(result).toBeNull()
    expect(mockStat).not.toHaveBeenCalled()
  })

  it("returns null for empty slug", async () => {
    const result = await getClinicConfig("")
    expect(result).toBeNull()
  })

  it("returns null for slug with uppercase", async () => {
    const result = await getClinicConfig("BadSlug")
    expect(result).toBeNull()
  })

  it("returns null when config file does not exist", async () => {
    mockStat.mockRejectedValue(new Error("ENOENT"))

    const result = await getClinicConfig("nonexistent")
    expect(result).toBeNull()
  })

  it("returns null for corrupted JSON", async () => {
    mockStat.mockResolvedValue({ size: 100 })
    mockReadFile.mockResolvedValue("{invalid json")

    const result = await getClinicConfig("broken")
    expect(result).toBeNull()
  })

  it("returns cached config on second call (no disk read)", async () => {
    mockStat.mockResolvedValue({ size: 500 })
    mockReadFile.mockResolvedValue(JSON.stringify(validConfig))

    await getClinicConfig("cached-test")
    await getClinicConfig("cached-test")

    expect(mockStat).toHaveBeenCalledTimes(1)
    expect(mockReadFile).toHaveBeenCalledTimes(1)
  })

  it("invalidateConfig forces re-read from disk", async () => {
    mockStat.mockResolvedValue({ size: 500 })
    mockReadFile.mockResolvedValue(JSON.stringify(validConfig))

    await getClinicConfig("invalidate-test")
    invalidateConfig("invalidate-test")
    await getClinicConfig("invalidate-test")

    expect(mockReadFile).toHaveBeenCalledTimes(2)
  })

  it("returns null for config > 1MB", async () => {
    mockStat.mockResolvedValue({ size: 2 * 1024 * 1024 })

    const result = await getClinicConfig("huge-config")
    expect(result).toBeNull()
    expect(mockReadFile).not.toHaveBeenCalled()
  })
})
