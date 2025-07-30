#!/usr/bin/env bun

import { parseArgs } from "util";
import { TikTokDownloader } from "./lib/downloader.js";

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