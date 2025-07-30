#!/usr/bin/env bun
import { parseArgs } from "util";
import { existsSync, mkdirSync } from "fs";
import path from "path";
import type { TikWMResponse } from "./types/tikwm.js";


class TikTokDownloader {
  private baseUrl = "https://www.tikwm.com/api/video";
  private userAgent = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36";

  async submitTask(url: string): Promise<string> {
    console.log("🔄 Submitting download request...");
    
    const formData = new FormData();
    formData.append("url", url);
    
    const response = await fetch(`${this.baseUrl}/task/submit`, {
      method: "POST",
      body: formData,
      headers: {
        "User-Agent": this.userAgent,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json() as TikWMResponse;
    
    if (data.code !== 0) {
      throw new Error(`API error: ${data.msg}`);
    }
    
    return data.data.task_id;
  }
  
  async getResult(taskId: string, maxRetries = 10): Promise<TikWMResponse["data"]> {
    console.log("⏳ Processing video...");
    
    for (let i = 0; i < maxRetries; i++) {
      const response = await fetch(`${this.baseUrl}/task/result?task_id=${taskId}`, {
        headers: {
          "User-Agent": this.userAgent,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json() as TikWMResponse;
      
      if (data.code !== 0) {
        throw new Error(`API error: ${data.msg}`);
      }
      
      // Status 2 means processing complete
      if (data.data.status === 2 && data.data.detail.download_url) {
        return data.data;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 2000));
      process.stdout.write(".");
    }
    
    throw new Error("Video processing timed out. Please try again later.");
  }
  
  async downloadVideo(downloadUrl: string, filename: string, outputDir: string): Promise<void> {
    const fullPath = path.join(outputDir, filename);
    
    console.log(`\n📥 Downloading to: ${fullPath}`);
    
    const response = await fetch(downloadUrl, {
      headers: {
        "User-Agent": this.userAgent,
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
        
        if (totalSize > 0) {
          const progress = ((downloadedSize / totalSize) * 100).toFixed(1);
          const mbDownloaded = (downloadedSize / 1024 / 1024).toFixed(1);
          const mbTotal = (totalSize / 1024 / 1024).toFixed(1);
          process.stdout.write(`\r📊 Progress: ${progress}% (${mbDownloaded}/${mbTotal} MB)`);
        }
      }
    } finally {
      writer.end();
      reader.releaseLock();
    }
    
    console.log(`\n✅ Download completed: ${filename}`);
  }
  
  sanitizeFilename(filename: string): string {
    return filename
      .replace(/[<>:"/\\|?*]/g, "")
      .replace(/\s+/g, "_")
      .replace(/[^\w\s\-_.]/g, "")
      .substring(0, 100);
  }
  
  validateTikTokUrl(url: string): boolean {
    const tiktokUrlRegex = /^https?:\/\/(www\.)?(tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com)/;
    return tiktokUrlRegex.test(url);
  }
  
  async download(url: string, outputDir: string = "./downloads"): Promise<void> {
    // Validate URL
    if (!this.validateTikTokUrl(url)) {
      throw new Error("Please provide a valid TikTok URL");
    }

    // Ensure output directory exists
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }
    
    // Submit task
    const taskId = await this.submitTask(url);
    
    // Get result
    const result = await this.getResult(taskId);
    
    // Generate filename
    const sanitizedTitle = this.sanitizeFilename(result.detail.title);
    const author = result.detail.author.unique_id;
    const videoId = result.detail.id;
    const filename = `${author}_${sanitizedTitle}_${videoId}.mp4`;
    
    // Display video info
    console.log(`\n📹 Title: ${result.detail.title}`);
    console.log(`👤 Author: ${result.detail.author.nickname} (@${result.detail.author.unique_id})`);
    console.log(`⏱️  Duration: ${result.detail.duration}s`);
    console.log(`📊 Size: ${(result.detail.size / 1024 / 1024).toFixed(1)} MB`);
    
    // Download video
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
  td "https://vm.tiktok.com/abcdef" -o ~/Videos

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

  // Fix TypeScript errors with proper type assertions and null coalescing
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

// Handle Ctrl+C gracefully
process.on("SIGINT", () => {
  console.log("\n\n👋 Download cancelled by user");
  process.exit(0);
});

// Handle uncaught errors
process.on("unhandledRejection", (error) => {
  console.error(`❌ Unhandled error: ${error}`);
  process.exit(1);
});

if (import.meta.main) {
  main();
}