import { cn } from "@/lib/utils"

describe("Utils", () => {
  describe("cn function", () => {
    it("merges class names correctly", () => {
      const result = cn("px-4", "py-2", "bg-blue-500")
      expect(result).toBe("px-4 py-2 bg-blue-500")
    })

    it("handles conditional classes", () => {
      const isActive = true
      const result = cn("base-class", isActive && "active-class")
      expect(result).toBe("base-class active-class")
    })

    it("handles falsy values", () => {
      const result = cn("base-class", false && "hidden-class", null, undefined)
      expect(result).toBe("base-class")
    })

    it("merges conflicting Tailwind classes correctly", () => {
      const result = cn("px-4 py-2", "px-6")
      expect(result).toBe("py-2 px-6")
    })
  })
})
