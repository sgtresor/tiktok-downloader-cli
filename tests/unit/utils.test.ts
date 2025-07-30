import { describe, expect, it } from "bun:test";
import { formatBytes, generateFilename, validateTikTokUrl } from "../../src/lib/utils";

describe("Utils", () => {
  describe("formatBytes", () => {
    it("should format bytes correctly", () => {
      expect(formatBytes(0)).toBe("0 B");
      expect(formatBytes(1024)).toBe("1 KB");
      expect(formatBytes(1024 * 1024)).toBe("1 MB");
      expect(formatBytes(1024 * 1024 * 1024)).toBe("1 GB");
      expect(formatBytes(1536)).toBe("1.5 KB");
    });
  });

  describe("validateTiktokUrl", () => {
    it("should validate correct TikTok URLs", () => {
      expect(validateTikTokUrl("https://www.tiktok.com/@user/video/123")).toBe(true);
      expect(validateTikTokUrl("https://vm.tiktok.com/abc123")).toBe(true);
      expect(validateTikTokUrl("https://vt.tiktok.com/xyz456")).toBe(true);
    });

    it("should reject invalid URLs", () => {
      expect(validateTikTokUrl("https://youtube.com/watch?v=123")).toBe(false);
      expect(validateTikTokUrl("not-a-url")).toBe(false);
      expect(validateTikTokUrl("")).toBe(false);
    });
  });

  describe("generateFilename", () => {
    it("should generate correct filename", () => {
      expect(generateFilename("testuser", "123456789")).toBe("testuser_123456789.mp4");
      expect(generateFilename("@user", "987654321")).toBe("@user_987654321.mp4");
    });
  });
});
