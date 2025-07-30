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
