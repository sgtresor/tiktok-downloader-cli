#!/usr/bin/env bun

import { parseArgs } from "util";
import { existsSync, mkdirSync } from "fs";
import path from "path";
import { TikWMAPI } from "./lib/api.js";
import { 
  validateTikTokUrl, 
  generateFilename, 
  displayProgress, 
  formatBytes 
} from "./lib/utils.js";

class TikTokDownloader {
  private api: TikWMAPI;

  constructor() {
    this.api = new TikWMAPI();
  }

  async downloadVideo(downloadUrl: string, filename: string, outputDir: string): Promise<void> {
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
    
    const filename = generateFilename(
      result.detail.author.unique_id,
      result.detail.id
    );
    
    console.log(`\n📹 Title: ${result.detail.title}`);
    console.log(`👤 Author: ${result.detail.author.nickname} (@${result.detail.author.unique_id})`);
    console.log(`⏱️  Duration: ${result.detail.duration}s`);
    console.log(`📊 Size: ${formatBytes(result.detail.size)}`);
    
    await this.downloadVideo(result.detail.download_url, filename, outputDir);
  }
}

async function main() {
  const { values, positionals } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      output: {
        type: "string",
        short: "o",
        default: "./downloads",
      },
      version: {
        type: "boolean",
        short: "v",
      },
      help: {
        type: "boolean",
        short: "h",
      },
    },
    allowPositionals: true,
  });

  if (values.version) {
    console.log("td v1.0.0");
    process.exit(0);
  }

  if (values.help) {
    console.log(`
🎵 TikTok Downloader (td) v1.0.0
Download highest quality TikTok videos without watermarks

Powered by tikwm.com API

Usage: td <tiktok_url> [options]

Options:
  -o, --output <dir>    Output directory (default: ./downloads)
  -v, --version         Show version number
  -h, --help           Show this help message

Examples:
  td "https://www.tiktok.com/@user/video/1234567890"
  td "https://vm.tiktok.com/abc123" -o ~/Videos

Supported URLs:
  • https://www.tiktok.com/@user/video/123456789
  • https://vm.tiktok.com/shortcode
  • https://vt.tiktok.com/shortcode
    `);
    process.exit(0);
  }

  if (positionals.length === 0) {
    console.error("❌ Error: Please provide a TikTok URL");
    console.log("Usage: td <tiktok_url>");
    console.log("Use 'td --help' for more information");
    process.exit(1);
  }

  const url = positionals[0] as string;
  const outputDir = (values.output ?? "./downloads") as string;

  console.log("🚀 TikTok Downloader starting...");
  console.log(`🔗 URL: ${url}`);
  console.log(`📁 Output: ${outputDir}`);

  try {
    const downloader = new TikTokDownloader();
    await downloader.download(url, outputDir);
  } catch (error) {
    console.error(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

process.on("SIGINT", () => {
  console.log("\n\n👋 Download cancelled by user");
  process.exit(0);
});

process.on("unhandledRejection", (error) => {
  console.error(`❌ Unhandled error: ${error}`);
  process.exit(1);
});

if (import.meta.main) {
  main();
}