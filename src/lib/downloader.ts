import { existsSync, mkdirSync } from "fs";
import path from "path";
import type { TikWMResponse } from "../types/tikwm.js";
import { TikWMAPI } from "./api.js";
import { checkFileExists, displayProgress, formatBytes, generateFilename, promptOverwrite, validateTikTokUrl } from "./utils.js";

export class TikTokDownloader {
  private api: TikWMAPI;

  constructor() {
    this.api = new TikWMAPI();
  }

  private async downloadFile(downloadUrl: string, filename: string, outputDir: string): Promise<void> {
    const fullPath = path.join(outputDir, filename);

    console.log(`\n📥 Downloading to: ${fullPath}`);

    const response = await fetch(downloadUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`Download failed! Status: ${response.status}`);
    }

    const contentLength = response.headers.get("content-length");
    const totalSize = contentLength ? parseInt(contentLength) : 0;
    let downloadedSize = 0;

    const writer = Bun.file(fullPath).writer();
    const reader = response.body?.getReader();

    if (!reader) {
      throw new Error("Failed to get response reader");
    }

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        writer.write(value);
        downloadedSize += value.length;

        displayProgress(downloadedSize, totalSize);
      }
    } finally {
      writer.end();
      reader.releaseLock();
    }

    console.log(`\n✅ Download completed: ${filename}`);
  }

  private displayVideoInfo(result: TikWMResponse["data"]): void {
    console.log(`\n📹 Title: ${result.detail.title}`);
    console.log(`👤 Author: ${result.detail.author.nickname} (@${result.detail.author.unique_id})`);
    console.log(`⏱️  Duration: ${result.detail.duration}s`);
    console.log(`📊 Size: ${formatBytes(result.detail.size)}`);
  }

  async download(url: string, outputDir: string = "./downloads"): Promise<void> {
    if (!validateTikTokUrl(url)) {
      throw new Error("Please provide a valid TikTok URL");
    }

    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    console.log("🔄 Submitting download request...");
    const taskId = await this.api.submitTask(url);

    console.log("⏳ Processing video...");
    const result = await this.api.getTaskResult(taskId);

    const filename = generateFilename(result.detail.author.unique_id, result.detail.id);
    const fullPath = path.join(outputDir, filename);

    // Check if file exists
    if (checkFileExists(fullPath)) {
      const shouldOverwrite = await promptOverwrite(filename);
      if (!shouldOverwrite) {
        console.log("✅ Download cancelled.");
        return;
      }
      console.log("📝 Proceeding with overwrite...");
    }

    this.displayVideoInfo(result);

    await this.downloadFile(result.detail.download_url, filename, outputDir);
  }
}
