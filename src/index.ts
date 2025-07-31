#!/usr/bin/env bun

import { parseArgs } from "util";
import packageJson from "../package.json" with { type: "json" };
import { TikTokDownloader } from "./lib/downloader.js";

const VERSION = packageJson.version;

function showHelp(): void {
  console.log(`
🎵 TikTok Downloader (td) v${VERSION}
Download highest quality TikTok videos without watermarks

Powered by tikwm.com API

Usage: td <tiktok_url> [options]

Options:
  -o, --output <dir>    Output directory (default: current directory)
  -v, --version         Show version number
  -h, --help           Show this help message

Examples:
  td "https://www.tiktok.com/@user/video/1234567890"
  td "https://vm.tiktok.com/abc123" -o ~/Videos

Supported URLs:
  • https://www.tiktok.com/@user/video/123456789
  • https://vm.tiktok.com/shortcode
  • https://vt.tiktok.com/shortcode

For more information, visit: https://github.com/yourusername/tiktok-downloader
  `);
}

function showVersion(): void {
  console.log(`td v${VERSION}`);
}

function showUsageError(): void {
  console.error("❌ Error: Please provide a TikTok URL");
  console.log("Usage: td <tiktok_url>");
  console.log("Use 'td --help' for more information");
}

async function main(): Promise<void> {
  const { values, positionals } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      output: {
        type: "string",
        short: "o",
        default: process.cwd(),
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
    showVersion();
    process.exit(0);
  }

  if (values.help) {
    showHelp();
    process.exit(0);
  }

  if (positionals.length === 0) {
    showUsageError();
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
