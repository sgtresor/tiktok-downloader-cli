import { existsSync } from "node:fs";

export function checkFileExists(filepath: string): boolean {
  return existsSync(filepath);
}

export async function promptOverwrite(filename: string): Promise<boolean> {
  console.log(`\n⚠️  File ${filename} already exists.`);
  console.log("Overwrite?");
  
  process.stdout.write("Choice (y/N): ");
  
  // Read user input from stdin
  for await (const line of console) {
    const input = line.toString().trim().toLowerCase();
    
    if (input === 'y' || input === 'yes') {
      return true;
    } else if (input === 'n' || input === 'no' || input === '') {
      return false;
    } else {
      process.stdout.write("Please enter 'y' for yes or 'n' for no: ");
    }
  }
  
  return false; // Default to no if something goes wrong
}


export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}

export function validateTikTokUrl(url: string): boolean {
  const tiktokUrlRegex = /^https?:\/\/(www\.)?(tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com)/;
  return tiktokUrlRegex.test(url);
}

export function generateFilename(author: string, videoId: string): string {
  return `${author}_${videoId}.mp4`;
}

export function displayProgress(downloadedSize: number, totalSize: number): void {
  if (totalSize > 0) {
    const progress = ((downloadedSize / totalSize) * 100).toFixed(1);
    const downloaded = formatBytes(downloadedSize);
    const total = formatBytes(totalSize);
    process.stdout.write(`\r📊 Progress: ${progress}% (${downloaded}/${total})`);
  }
}
