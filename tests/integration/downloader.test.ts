import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { TikTokDownloader } from "../../src/lib/downloader.js";
import { existsSync, rmSync } from "fs";

describe("TikTokDownloader Integration", () => {
  const testOutputDir = "./test-downloads";
  let downloader: TikTokDownloader;

  beforeAll(() => {
    downloader = new TikTokDownloader();
  });

  afterAll(() => {
    if (existsSync(testOutputDir)) {
      rmSync(testOutputDir, { recursive: true });
    }
  });

  it("should create TikTokDownloader instance", () => {
    expect(downloader).toBeInstanceOf(TikTokDownloader);
  });

  it("should reject invalid URLs", async () => {
    expect(async () => {
      await downloader.download("https://youtube.com/invalid", testOutputDir);
    }).toThrow();
  });
});