import { afterEach, describe, expect, it, spyOn } from "bun:test";
import { existsSync, unlinkSync, writeFileSync } from "node:fs";
import {
  checkFileExists,
  formatBytes,
  generateFilename,
  promptOverwrite,
  validateTikTokUrl,
} from "../../src/lib/utils.js";

class MockConsole {
  log = () => {};

  constructor(private responses: string[]) {}

  async *[Symbol.asyncIterator]() {
    for (const response of this.responses) {
      yield { toString: () => response };
    }
  }
}

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

  describe("checkFileExists", () => {
    const testFile = "./test-file.mp4";

    afterEach(() => {
      if (existsSync(testFile)) {
        unlinkSync(testFile);
      }
    });

    it("should return true when file exists", () => {
      writeFileSync(testFile, "test content");
      expect(checkFileExists(testFile)).toBe(true);
    });

    it("should return false when file does not exist", () => {
      expect(checkFileExists("./non-existent-file.mp4")).toBe(false);
    });
  });

  describe("promptOverwrite", () => {
    let originalConsole: any;
    let mockStdoutWrite: any;

    afterEach(() => {
      if (originalConsole) {
        global.console = originalConsole;
      }
      if (mockStdoutWrite) {
        mockStdoutWrite.mockRestore();
      }
    });

    it("should return true when user enters 'y'", async () => {
      originalConsole = global.console;
      mockStdoutWrite = spyOn(process.stdout, "write").mockImplementation(() => true);

      global.console = new MockConsole(["y\n"]) as any;

      const result = await promptOverwrite("test.mp4");
      expect(result).toBe(true);
    });

    it("should return false when user enters 'n'", async () => {
      originalConsole = global.console;
      mockStdoutWrite = spyOn(process.stdout, "write").mockImplementation(() => true);

      global.console = new MockConsole(["n\n"]) as any;

      const result = await promptOverwrite("test.mp4");
      expect(result).toBe(false);
    });

    it("should return false when user enters empty string", async () => {
      originalConsole = global.console;
      mockStdoutWrite = spyOn(process.stdout, "write").mockImplementation(() => true);

      global.console = new MockConsole(["\n"]) as any;

      const result = await promptOverwrite("test.mp4");
      expect(result).toBe(false);
    });

    it("should keep asking until valid input", async () => {
      originalConsole = global.console;
      mockStdoutWrite = spyOn(process.stdout, "write").mockImplementation(() => true);

      global.console = new MockConsole(["invalid\n", "also-bad\n", "y\n"]) as any;

      const result = await promptOverwrite("test.mp4");
      expect(result).toBe(true);
    });
  });
});
